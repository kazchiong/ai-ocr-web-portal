"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import ReactWebcam from "react-webcam";

type captureData = {
    institution: String,
    medication: String,
    dosage: String,
    totalTabs: number,
    patientName: String,
    patientIc: String,
}

export default function Scan() {
  const router = useRouter();
  const webcamRef = useRef<ReactWebcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureData, setCaptureData] = useState<captureData[]>([]);
  const [ocrText, setOcrText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [user, setUser] = useState<{
    id: number;
    institution_id?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/me", { method: "POST" })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  // 📸 Capture from webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setOcrText("");
      setCaptureData([]);
      setOcrConfidence(null);
    }
  }, [webcamRef]);

  // 📁 Upload image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setOcrText("");
        setCaptureData([]);
        setOcrConfidence(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🔁 Retake image
  const handleRetake = () => {
    setCapturedImage(null);
    setOcrText("");
    setCaptureData([]);
    setOcrConfidence(null);
  };

  function dataURLtoFile(url: string, filename: string) {
    const arr = url.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleScan = async () => {
    if (!capturedImage) return;

    setLoading(true);
    setOcrText("");
    setCaptureData([]);
    setOcrConfidence(null);

    try {
      const file = dataURLtoFile(capturedImage, "capture.png");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();
      const conf = data?.results?.[0]?.capture?.ocrConfidence ?? data?.results?.[0]?.parsed?.ocrConfidence ?? null;
      setOcrConfidence(typeof conf === "number" ? conf : Number(conf));
      
      // Parse the response data
      const parsedData = data?.results?.[0]?.parsed;
      if (parsedData) {
        // Ensure captureData is always an array
        if (Array.isArray(parsedData)) {
          setCaptureData(parsedData);
        } else {
          // If it's a single object, wrap it in an array
          setCaptureData([parsedData]);
        }
      } else {
        setCaptureData([]);
      }

      // Safely access OCR text
      const ocrText = data?.results?.[0]?.capture?.ocrText ?? "";
      setOcrText(ocrText || "No text detected.");
    } catch (err) {
      console.error(err);
      setOcrText("OCR failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 📋 Copy text
  const handleCopy = () => {
    navigator.clipboard.writeText(ocrText);
    alert("Copied to clipboard!");
  };

  // 💾 Download text
  const handleDownload = async () => {
    try {
      const res = await fetch("/api/captures/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageStr: capturedImage,
          ocrText,
          captureData,
          userId: user?.id,
          institutionId: user?.institution_id,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Upload failed:", text);
        alert("Save failed");
        return;
      }

      const text = await res.text();
      if (!text) {
        alert("Saved, but server returned empty response");
        router.push("/history");
        return;
      }

      const data = JSON.parse(text);
      console.log("Image saved at:", data.file);
      alert("Image saved!");
      router.push("/history");

    } catch (err) {
      console.error("Save error:", err);
      alert("Unexpected error while saving");
    }
  };

  // 🧮 Word count + characters
  const confidencePct = ocrConfidence === null ? null : Math.round(ocrConfidence * 100);
  const wordCount = ocrText ? ocrText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = ocrText.length;

  const videoConstraints = {
    facingMode: "environment",
    width: 1280,
    height: 960,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Document Scanner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Capture or upload medical documents, prescriptions, and reports for instant AI-powered text extraction
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("camera")}
                className={`flex-1 px-6 py-4 text-lg font-medium text-center transition-all ${activeTab === "camera"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                📸 Camera Capture
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 px-6 py-4 text-lg font-medium text-center transition-all ${activeTab === "upload"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                📁 File Upload
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Capture/Upload Area */}
            <div className="mb-8">
              {!capturedImage ? (
                <div className="space-y-6">
                  {activeTab === "camera" ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[700px]">
                        <ReactWebcam
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={videoConstraints}
                          className="w-full h-full object-cover"
                          audio={false}
                          mirrored={false}
                          screenshotQuality={1}
                        />
                        {/* Camera Overlay Grid */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="grid grid-cols-3 grid-rows-3 h-full">
                            {[...Array(9)].map((_, i) => (
                              <div
                                key={i}
                                className="border border-white border-opacity-20"
                              />
                            ))}
                          </div>
                        </div>
                        {/* Capture Guide Text */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
                          📍 Position document within frame
                        </div>
                      </div>
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <button
                          onClick={capture}
                          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200 border-4 border-blue-200"
                        >
                          <div className="w-16 h-16 bg-red-500 rounded-full hover:bg-red-600 transition-colors"></div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center h-[70vh] min-h-[500px] max-h-[700px] flex flex-col items-center justify-center">
                      <div className="text-6xl mb-6">📁</div>
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                        Upload Document
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md">
                        Supported formats: JPG, PNG, PDF, WEBP
                      </p>
                      <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-lg">
                        📂 Choose File
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        or drag and drop your file here
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 relative">
                  {/* Document Image */}
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 h-[70vh] min-h-[500px] max-h-[700px] flex items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Captured document"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={handleRetake}
                      className="px-8 py-4 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2 text-lg"
                    >
                      <span>🔄</span>
                      <span>Retake Photo</span>
                    </button>
                    <button
                      onClick={handleScan}
                      disabled={loading}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 text-lg"
                    >
                      {loading ? (
                        <>
                        </>
                      ) : (
                        <>
                          <span>🧠</span>
                          <span>Scan Document</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {ocrText && (
              <div className="space-y-8">
                {/* OCR Text Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      📝 Extracted Text
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopy}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                      >
                        <span>📋</span>
                        <span>Copy Text</span>
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium"
                      >
                        <span>💾</span>
                        <span>Save Capture</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
                    <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-sans text-base leading-relaxed max-h-96 overflow-y-auto">
                      {ocrText}
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-8 text-base text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-3 bg-white dark:bg-gray-600 px-4 py-2 rounded-lg">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <div className="font-semibold">
                          {confidencePct === null ? "—" : `${confidencePct}%`}
                        </div>
                        <div className="text-sm">Confidence</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white dark:bg-gray-600 px-4 py-2 rounded-lg">
                      <span className="text-2xl">🧮</span>
                      <div>
                        <div className="font-semibold">{wordCount}</div>
                        <div className="text-sm">Words</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white dark:bg-gray-600 px-4 py-2 rounded-lg">
                      <span className="text-2xl">🔤</span>
                      <div>
                        <div className="font-semibold">{charCount}</div>
                        <div className="text-sm">Characters</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Structured Medication Data Section */}
                {captureData.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-blue-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <span className="mr-3">💊</span>
                        Extracted Medication Information
                      </h3>
                      <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                        {captureData.length} item{captureData.length !== 1 ? 's' : ''} found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {captureData.map((data, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                              Medication #{index + 1}
                            </h4>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                              {data.institution || "Unknown Institution"}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Medication</label>
                              <p className="mt-1 text-gray-900 dark:text-white font-semibold text-lg">
                                {data.medication || "Not specified"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dosage</label>
                                <p className="mt-1 text-gray-900 dark:text-white">
                                  {data.dosage || "Not specified"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tabs</label>
                                <p className="mt-1 text-gray-900 dark:text-white font-bold">
                                  {data.totalTabs || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient Information</label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                  <span className="text-gray-400 dark:text-gray-500 mr-2">👤</span>
                                  <span className="text-gray-900 dark:text-white">
                                    {data.patientName || "Not specified"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-400 dark:text-gray-500 mr-2">🆔</span>
                                  <span className="text-gray-900 dark:text-white font-mono">
                                    {data.patientIc || "Not specified"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            {!ocrText && !loading && !capturedImage && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-xl flex items-center">
                  <span className="text-2xl mr-3">💡</span>
                  Tips for Better OCR Results
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-300 text-lg">
                        ☀️
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200">
                        Good Lighting
                      </h5>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Ensure even lighting without shadows or glare
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-300 text-lg">
                        📏
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200">
                        Flat Surface
                      </h5>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Place documents on a flat surface to avoid distortion
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-300 text-lg">
                        🎯
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200">
                        Clear Focus
                      </h5>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Hold steady and ensure text is in focus and legible
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-300 text-lg">
                        🖼️
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200">
                        Fill the Frame
                      </h5>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Position the document to fill most of the camera view
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Tips */}
            {loading && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">⏳</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Processing your document...
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      This usually takes 10-30 seconds depending on image
                      quality and text complexity
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}