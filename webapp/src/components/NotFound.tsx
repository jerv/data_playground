import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center bg-gray-50 p-4 flex-grow">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-3xl font-bold text-dark-800 mt-4">Page Not Found</h2>
        <p className="text-dark-500 mt-2 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center mt-8"
        >
          <FiHome className="mr-2" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound; 