import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      title: "AI-Powered OCR",
      description: "Advanced machine learning for accurate text extraction",
      icon: "🤖",
    },
    {
      title: "Medical Documents",
      description: "Specialized in prescriptions and medical sticker laber",
      icon: "🏥",
    },
    {
      title: "Secure Storage",
      description: "Your documents are safely stored and encrypted",
      icon: "🔒",
    },
    {
      title: "Instant Results",
      description: "Get extracted text in seconds with high confidence",
      icon: "⚡",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Extract Text from{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Medical Images
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  Upload medical images, prescriptions, and sticker laber. Instantly
                  convert them into accurate, structured text using AI-powered
                  OCR technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Start Scanning
                  <span className="ml-2">→</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    99%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Accuracy
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    15s
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Avg. Processing
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    30K+
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Documents
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Visual */}
            <div className="relative">
              <div className="relative rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                <Image
                  className="rounded-xl"
                  src="/images/ocr-demo.png"
                  alt="Medical OCR System Preview"
                  width={600}
                  height={400}
                  priority
                />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rotate-12 opacity-20"></div>
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl -rotate-12 opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose MediVision AI?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Designed specifically for medical document processing with speed,
              accuracy, and security in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Digitize Medical Documents?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Experience fast and accurate OCR built for healthcare use cases.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
            >
              Get Started
              <span className="ml-2">🎯</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
