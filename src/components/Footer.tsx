import React from "react";

const Footer: React.FC<{ onOpenHistory: () => void }> = ({ onOpenHistory }) => {
  return (
    <footer className="bg-[#1F1F1F] text-gray-300 py-3 mt-10 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          {/* Logo / Title */}
          <div>
            <h2 className="text-lg font-semibold text-white">Compiler Playground</h2>
            <p className="text-sm text-gray-400">
              Professional Lexical Analyzer & Parser
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center space-x-12 text-sm">
            <a href="/" className="hover:text-white transition">Home</a>
            <button
              onClick={onOpenHistory}
              className="hover:text-white transition"
            >
              History
            </button>
            <a
              href="https://github.com/mlswijerathne/lexical-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Github Repo
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Compiler Playground. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
