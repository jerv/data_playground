import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogIn, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials for avatar
  const getInitials = () => {
    const username = authState.user?.username || '';
    return username.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm py-4 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/playground" className="text-xl font-bold gradient-text">
          Data Playground
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-medium">
              {getInitials()}
            </div>
            <span className="text-dark-800 hidden sm:inline-block">
              {authState.user?.username}
            </span>
            <FiChevronDown className={`transition-transform duration-200 ${isMenuOpen ? 'transform rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser className="mr-2" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-dark-700 hover:bg-gray-100 flex items-center"
              >
                <FiLogIn className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 