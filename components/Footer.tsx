export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              MediVision AI
            </h3>
            <p className="text-gray-300 max-w-md">
              AI-powered platform for digitizing medical prescriptions and
              extracting text accurately and securely.
            </p>
          </div>

          {/* Project Info */}
          <div className="flex items-center md:justify-end">
            <p className="text-gray-400 text-sm text-center md:text-right">
              Empowering healthcare with intelligent document processing
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 MediVision AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
