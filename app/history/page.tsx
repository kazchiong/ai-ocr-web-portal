"use client";
import { useEffect, useState } from "react";

interface Captures {
  id: number;
  file_name: string;
  created_at: Date;
  user: string;
  institution: string;
  ocrText: string;
}

export default function HistoryPage() {
  const [captures, setCaptures] = useState<Captures[]>([]);
  const [selectedCapture, setSelectedCapture] = useState<Captures | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<{
    role_id?: number;
    institution_id?: number;
  } | null>(null);

  const [copyMessage, setCopyMessage] = useState(""); // Copy notification state

  useEffect(() => {
    fetch("/api/me", { method: "POST" })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return; // dont run until user is loaded

    fetch("/api/captures/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institution_id: user.institution_id, role_id: user.role_id })
    })
      .then(res => res.json())
      .then(data => {
        const sortedCaptures = data.captures.sort(
          (a: Captures, b: Captures) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCaptures(sortedCaptures);
      });
  }, [user]);

  // Filter records based on search term
  const filteredRecords = captures.filter(record =>
    record.ocrText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.created_at.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (index: number, id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    const updated = [...captures];
    updated.splice(index, 1);
    setCaptures(updated);
    fetch("/api/captures/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capture_id: id })
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy handler with notification
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage("✅ Copied!");
    setTimeout(() => setCopyMessage(""), 2000); // disappears after 2s
  };

  return (
    <div className="min-h-screen bg-grayb-50 dark:bg-gray-900 py-8 relative">
      {/* Copy Notification */}
      {copyMessage && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg z-50">
          {copyMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📜 OCR History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review your previously scanned documents and extracted text
          </p>
        </div>

        {/* Stats and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {captures.length} documents
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last scan: {captures[0] ? formatDate(captures[0].created_at.toString()) : 'Never'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search history..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Records Grid */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No matching records found" : "No OCR history yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Start by scanning your first document"}
            </p>
            {!searchTerm && (
              <a
                href="/scan"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🧠 Start Scanning
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecords.map((capture, index) => (
              <div
                key={index}
                className="card-hover bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Image */}
                <div className="relative group">
                  <img
                    src={"/captures/" + capture.file_name}
                    alt={`Scan ${index + 1}`}
                    className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {formatDate(capture.created_at.toString())}
                    </span>
                    {(user?.role_id === 3 || user?.role_id === 2) && (<button
                      onClick={() => handleDelete(index, capture.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded"
                      title="Delete record"
                    >
                      🗑️
                    </button>)}
                  </div>  

                  {/* Text Preview */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {capture.ocrText || "No text detected"}
                    </p>
                    {capture.ocrText && (
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {capture.ocrText.split(/\s+/).filter(Boolean).length} words
                        </span>
                        <span>
                          {capture.ocrText.length} chars
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          User: {capture.user}
                        </span>
                        <span>
                          Institution: {capture.institution}
                        </span>
                      </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopy(capture.ocrText)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => setSelectedCapture(capture)}
                      className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      👁️ View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing full record */}
        {selectedCapture && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Scan Details - {formatDate(selectedCapture.created_at.toString())}
                </h3>
                <button
                  onClick={() => setSelectedCapture(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Original Image</h4>
                    <img
                      src={"/captures/" + selectedCapture.file_name}
                      alt="Full scan"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Extracted Text</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans">
                        {selectedCapture.ocrText || "No text detected"}
                      </pre>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleCopy(selectedCapture.ocrText)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        📋 Copy Text
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([selectedCapture.ocrText], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `ocr_result_${selectedCapture.file_name.replace(".png", "")}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        💾 Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
