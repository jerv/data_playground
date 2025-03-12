import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-dark-500 text-sm">
            © {currentYear} Data Playground. All rights reserved.
          </p>
        </div>
        
        <div>
          <a 
            href="https://jeremyvenegas.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-dark-500 hover:text-primary-600 text-sm"
          >
            jeremyvenegas.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 