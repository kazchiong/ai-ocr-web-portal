import openai from "./openai";


/* ----------------------
    normalising stuffs
------------------------*/

// normalise "LORATADINE" or "loratadine" -> "Loratadine" 
// and "(bedok)" -> "(Bedok)", "(elias Mall)" -> "(Elias Mall)"
export function toTitleCase(name: string): string {
    return name
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/(^[^a-z]*)([a-z])/i, (_, prefix, ch) => prefix + ch.toUpperCase()))
        .join(" ")
        .trim();
}

function normalizeForMatch(s: string): string {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""); // remove spaces, punctuation
}

function ocrContainsMedication(ocrText: string, med: string): boolean {
    const o = normalizeForMatch(ocrText);
    const m = normalizeForMatch(med);
    if (!m) return false;
    return o.includes(m);
}



/* --------------------------------
    extract institution, meds, IC
----------------------------------*/

// try to extract institution name using keywords
export function extractInstitution(ocrText: string): string | null {
    const lines = ocrText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const candidates = lines.filter((line) =>
        /(HOSPITAL|POLYCLINIC|MEDICAL|CLINIC|HEALTH)/i.test(line)
    );

    if (candidates.length === 0) return null;

    return candidates
        .reduce((a, b) => (b.length > a.length ? b : a))
        .replace(/\s+/g, " ")
        .trim();
}


// extract medication names by capturing name + dosage patterns
export function extractMedications(ocrText: string): string[] {
    const meds = new Set<string>();

    const regex = /([A-Za-z][A-Za-z\-]*(?:\s+[A-Za-z][A-Za-z\-]*)*)\s*\([^)]*\d+(?:\.\d+)?\s*(mg|ml|mcg|g|iu)[^)]*\)/gi;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(ocrText)) !== null) {
        meds.add(toTitleCase(match[1]));
    }

    return Array.from(meds);
}


// extracts correct ICs from OCR text WITHOUT guessing from random numbers
function extractFromText(ocrText: string): string[] {
    const text = ocrText.toUpperCase();

    // full IC OR already half-censored IC only
    const match = text.match(/\b(?:[STFGM]\d{7}|XXX\d{5}|XXXX\d{4}|XXXXX\d{3})[A-Z]\b/g) ?? [];

    // normalize + remove duplicates
    const result: string[] = [];

    for (const ic of match) {
        const normalized = normalizeIc(ic);
        if (!result.includes(normalized)) {
            result.push(normalized);
        }
    }

    return result;
}



/* ---------------------------
   splitting medication helpers
----------------------------*/

function isNullishLine(s: string | undefined | null): boolean {
    if (!s) return true;
    const t = s.trim().toLowerCase();
    return t === "" || t === "null" || t === "none" || t === "n/a";
}

// split "Loratadine 10mg Tab" -> { medication: "Loratadine", dosage: "10mg" }
// split "Dextromethorphan 15mg/5ml Linctus 100ml" -> dosage can be "15mg/5ml" (best effort)
function splitMedicationAndDosage(line: string | null): {
    medication: string | null;
    dosage: string | null;
    medicationDisplay: string | null;
} {
    if (!line || isNullishLine(line)) {
        return { medication: null, dosage: null, medicationDisplay: null};
    }

    const s = line.replace(/\s+/g, " ").trim();

    // split on +, &, ,, or "and"
    const parts = s.split(/\s*(?:\+|&|,|\band\b)\s*/i).map(p => p.trim()).filter(Boolean);

    const meds: string[] = [];
    const doses: string[] = [];
    const paired: string[] = [];

    for (const part of parts) {
        const m = part.match(/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:ml|mg|g))?)\b/i);

        if (!m) {
            // no strength found; keep raw part as a "med name" fallback
            meds.push(part);
            continue;
        }

        let dosage = m[1].replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/").trim();

        dosage = dosage
            .replace(/(\d)(?=(mg|mcg|g|iu|ml)\b)/gi, "$1 ")
            .replace(/\b(mg|mcg|g|iu|ml)\b/gi, (u) => u.toLowerCase())
            .replace(/\s+/g, " ")
            .trim();

        const idx = m.index ?? -1;
        const rawMed = idx > 0 ? part.slice(0, idx).trim() : part.trim();
        const med = toTitleCase(rawMed);

        meds.push(med);
        doses.push(dosage);
        paired.push(`${med} ${dosage}`.trim());
    }

    return {
        medication: meds.length ? meds.join(" + ") : null,
        dosage: doses.length ? doses.join(" + ") : null,
        medicationDisplay: paired.length ? paired.join(" + ") : null,
    };
}



/* ---------------------------
   SG IC validation helpers
----------------------------*/

function normalizeIc(s: string): string {
    return s.replace(/\s+/g, "").toUpperCase().trim();
}


// double checks if extracted IC are correct
function isValidSgIc(s: string): boolean {
    const t = normalizeIc(s);

    // allow already half-censored formats like XXXXX123A (from 3 X to 5 Xs)
    const censored = /^(?:XXX\d{5}|XXXX\d{4}|XXXXX\d{3})[A-Z]$/.test(t);

    // standard full NRIC/FIN uncensored
    const full = /^[STFGM]\d{7}[A-Z]$/.test(t);

    return full || censored;
}


// Force output into half-censored form like XXXXX892J (keep last 4 chars)
function toHalfCensoredIc(ic: string): string | null {
    const t = normalizeIc(ic);
    if (!isValidSgIc(t)) return null;

    // Full form: S1234567D => XXXXX567D
    return "XXXXX" + t.slice(-4);
}



/* ---------------------------
    total tabs helpers
----------------------------*/

function parseTotalTabs(line: string | null): number | null {
    if (!line || isNullishLine(line)) return null;

    // Common patterns include:
    // "Total: 10 tab", "10 TAB", "6 tablets", "x20", "#20"
    const digits = line.replace(/[^\d]/g, "");
    if (!digits) return null;

    const n = Number(digits);
    return Number.isFinite(n) && n > 0 ? n : null;
}



/* ---------------------------
   AI-based Extraction (OpenAI)
----------------------------*/

export type AIExtractResult = {
    institution: string | null;
    medication: string | null;   // drug name only
    dosage: string | null;       // strength only eg. "10mg"
    medicationDisplay: string | null;
    totalTabs: number | null;    // quantity eg. 10 Tablets
    patientName: string | null;
    patientIc: string | null;
};

export async function extractWithAI(
    ocrText: string
): Promise<AIExtractResult> {
    const prompt = `
    when reading, be aware that the OCR scanned text could end up creating imaginary words, letters or numbers or could even convert letters to numbers, vice versa.
    
    1. can you read this messy OCR text and tell me what it’s supposed to say, assuming the scanning is bad?
    2. from the cleaned text, identify the medical institution and the medication name and dosage, based on what is commonly seen in singapore prescriptions. Some medications will include brand names, do not include brand names.
    3. if there are typos in the institution name, medication name, or dosage, correct them using what is commonly prescribed or practiced in singapore, but do not change the prescribed medicaion.
    4. take note of the way the medication should be consumed (e.g. dissolve, chew, take with food, frequency, form such as tablet or syrup), and use this information to help identify the correct medication and dosage if the text is unclear.
    5. identify the total number of tablets or quantity supplied. this may be stated explicitly (e.g. "total: 10 tablets", "6 tabs") or implicitly (e.g. "x20", "#20"). infer only when reasonable.
    6. identify the patient's name if present.
    7. identify the patient's singapore identification number if present. this may be partially censored or encrypted and may follow sgrean, singapore pr, or work permit formats. output it in a half-censored format (e.g. XXXXX123A). if it is not present, omit it.
    8. only if there are location clues such as postal code, unit number, or area name, use them to help identify the correct medical institution, and ensure that the institution exists in singapore.
    9. if the OCR perfectly reads certain words, assume those words are correct and do not change them.

    your final answer must ONLY return the following 5 lines, in this exact order:

    line 1: institution name only (no address)
    line 2: medication + stength
    line 3: total number of tablets or quantity
    line 4: patient's name
    line 5: patient's half-censored singapore ic number

    do not include explanations, reasoning, or any extra text.

${ocrText}
`;

    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        temperature: 0,
        input: prompt,
    });

    // use the convenience helper instead of digging into output[0].content[0]
    const raw = response.output_text?.trim() ?? "";

    // expected examples:
    // "Loratadine\nSengkang General Hospital"
    // "Acetylcysteine\nSingHealth Polyclinics – Pasir Ris"
    const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const institutionLine = lines[0] ?? null;
    const institution = !isNullishLine(institutionLine) ? institutionLine : null;

    const medDoseLine = lines[1] ?? null;
    const { medication, dosage, medicationDisplay} = splitMedicationAndDosage(medDoseLine);

    const totalTabsLine = lines[2] ?? null;
    const totalTabs = parseTotalTabs(totalTabsLine);

    const patientNameLine = lines[3] ?? null;
    const patientName = !isNullishLine(patientNameLine) ? patientNameLine : null;

    
    const patientIcLine = lines[4] ?? null;
    // only accepts an IC if it appears in OCR text 
    let patientIc: string | null = null;

    if (!isNullishLine(patientIcLine)) {
        // If AI returned something like XXXXX892J or S1234567D, accept only if OCR text contains it (or its last 4).
        const aiIc = normalizeIc(patientIcLine!);

        // Try to turn into half-censored form safely
        const censored = toHalfCensoredIc(aiIc);

        if (censored) {
            // Only accept ICs that truly exist in OCR text as 9-character patterns
            const ocrIcs = extractFromText(ocrText)
                .map(toHalfCensoredIc)
                .filter((x): x is string => !!x);

            if (ocrIcs.includes(censored)) {
                patientIc = censored;
            }
        }
}


    return {
        institution,
        medication,
        dosage,
        medicationDisplay,
        totalTabs,
        patientName,
        patientIc,
  };
}


/* ---------------------------
   Combined Extractor (AI + Fallback)
----------------------------*/

export async function extractCombined(ocrText: string) {
    try {
        const ai = await extractWithAI(ocrText);

        // fallback for medication:
        // extractMedications() returns string[] → we use the first medication if AI fails
        const fallbackMeds = extractMedications(ocrText);
        const fallbackMedication = fallbackMeds.length ? fallbackMeds[0] : null;

        const institutionRaw = ai.institution ?? extractInstitution(ocrText);

        const aiMedicationOk = ai.medication && ocrContainsMedication(ocrText, ai.medication);
        const medicationRaw = aiMedicationOk ? ai.medication : (fallbackMedication ?? ai.medication);

        return {
            institution: institutionRaw ? toTitleCase(institutionRaw) : null,
            medication: medicationRaw ? toTitleCase(medicationRaw) : null,
            dosage: ai.dosage? ai.dosage.toLowerCase() : null,
            medicationDisplay: ai.medicationDisplay ?? null,
            totalTabs: ai.totalTabs,
            patientName: ai.patientName ? toTitleCase(ai.patientName) : null,
            patientIc: ai.patientIc,
        };
    } catch (err) {
        console.error("AI extraction failed, using regex fallback:", err);
        
        const fallbackMeds = extractMedications(ocrText);
        const fallbackMedication = fallbackMeds.length ? fallbackMeds[0] : null;

        return {
            institution: extractInstitution(ocrText)? toTitleCase(extractInstitution(ocrText)!) : null,
            medication: fallbackMedication ? toTitleCase(fallbackMedication) : null,
            dosage: null,
            medicationDisplay: null,
            totalTabs: null,
            patientName: null,
            patientIc: null,
        };
    }
}
