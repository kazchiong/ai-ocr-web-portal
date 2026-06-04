export default function About() {
  const team = [
    {
      name: "Kayden",
      role: "AI Engineering",
      description: "Advanced neural networks for intelligent text recognition"
    },
    {
      name: "Kaz",
      role: "Medical Experts",
      description: "Specialized in medical document and clinical data processing"
    },
    {
      name: "Jia Hao",
      role: "Data Security",
      description: "Ensuring enterprise-grade privacy and regulatory compliance"
    }
  ];

  const technologies = [
    "Deep Learning Models",
    "Computer Vision",
    "Natural Language Processing",
    "Cloud Infrastructure",
    "Real-time Processing",
    "Data Encryption"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VisionText Solutions
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A Singapore-based technology company delivering AI-powered Optical Character Recognition solutions for healthcare and enterprise document workflows.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-700 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                To empower organizations with accurate, secure, and intelligent document digitization using advanced artificial intelligence technologies.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    High-accuracy AI-powered text extraction
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Medical and enterprise document specialization
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Secure, compliant, and privacy-first design
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Innovation in OCR</h3>
              <p className="text-blue-100">
                VisionText Solutions leverages state-of-the-art machine learning models to deliver highly accurate OCR for medical images, prescriptions, and complex structured documents.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200"
              >
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tech}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Our Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="card-hover bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <div className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {member.role}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
