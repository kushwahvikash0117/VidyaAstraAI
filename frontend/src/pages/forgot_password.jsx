import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ForgotPassword = () => {
  // State Management
  const [resetUsername, setResetUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-hide success or error messages after 5 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const input = resetUsername.trim();

    if (!input) {
      setErrorMsg('Please enter your username or email.');
      return;
    }

    setIsLoading(true);

    api.forgotPassword(input)
      .then((response) => {
        setIsLoading(false);
        setSuccessMsg(response.message || 'If this account exists, a password reset link has been sent to the registered email.');
        setResetUsername('');
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorMsg(error.message || 'An error occurred. Please try again.');
      });
  };

  return (
    <div className="bg-[#e9ecef] font-sans min-h-screen flex flex-col">
      {/* Embedded CSS for custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .input-field:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 58, 106, 0.15);
        }
      `}</style>

      {/* Top Yellow Stripe */}
      <div className="w-full h-1 bg-[#FECD0B]"></div>

      {/* Header */}
      <header className="bg-[#003A6A] w-full overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center md:justify-start">
            <a href="/" title="NIT Jalandhar" className="w-full">
              <img 
                src="https://v1.nitj.ac.in/erp/Images/logo.png" 
                alt="NIT Jalandhar Logo" 
                className="w-auto max-w-full max-h-12 md:max-h-20 h-auto object-contain"
              />
            </a>
          </div>
        </div>
      </header>

      {/* Navbar */}
      <nav className="bg-[#222] w-full shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <a 
              href="/" 
              className="text-[#FECD0B] font-semibold text-lg md:text-xl tracking-wide hover:text-yellow-300 transition-colors duration-200" 
              title="Vidyastra AI"
            >
              | Vidyastra AI |
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            
            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#003A6A]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#003A6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#003A6A]" style={{ fontFamily: 'Arial, sans-serif' }}>
                Forgot Password
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Enter your registered username or email to reset your password.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center" role="alert">
                {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center" role="alert">
                {successMsg}
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label htmlFor="reset-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username / Email:
                </label>
                <input 
                  type="text" 
                  id="reset-username" 
                  name="reset_username" 
                  placeholder="Enter your username or email"
                  required
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  className="input-field w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#003A6A]"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 bg-[#003A6A] text-white font-bold text-base rounded-lg transition-all duration-200 hover:bg-[#004a8a] focus:outline-none focus:ring-2 focus:ring-[#003A6A] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Reset Password'}
              </button>

              {/* Back to Login Link */}
              <div className="mt-4 text-center">
                <a 
                  href="/" 
                  className="text-[#003A6A] text-sm font-medium hover:underline transition-colors duration-200"
                >
                  &larr; Back to Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#003A6A] w-full mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <p className="text-white text-xs md:text-sm text-center leading-relaxed" style={{ fontFamily: 'Verdana, sans-serif' }}>
            Copyright 2026 &copy; NIT Jalandhar
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;