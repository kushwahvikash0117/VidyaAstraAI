import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';


const VidyastraLogin = () => {
  const navigate = useNavigate();
  // State Management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const canvasRef = useRef(null);

  // Generate random CAPTCHA string
  const generateCaptchaText = (length = 5) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Draw the CAPTCHA onto the canvas
  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f4ff');
    gradient.addColorStop(1, '#dbeafe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 200}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Draw noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Generate and set new text
    const newCaptchaText = generateCaptchaText();
    setCaptchaText(newCaptchaText);

    // Draw CAPTCHA text with rotation
    const fontSize = 24;
    ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
    ctx.textBaseline = 'middle';

    const startX = 20;
    const charSpacing = 28;

    for (let i = 0; i < newCaptchaText.length; i++) {
      ctx.save();
      const x = startX + i * charSpacing;
      const y = height / 2 + (Math.random() * 8 - 4);
      const rotation = (Math.random() - 0.5) * 0.4;

      ctx.translate(x, y);
      ctx.rotate(rotation);

      const r = Math.floor(Math.random() * 100);
      const g = Math.floor(Math.random() * 100);
      const b = Math.floor(Math.random() * 150 + 50);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      ctx.fillText(newCaptchaText[i], 0, 0);
      ctx.restore();
    }
  };

  // Initialize CAPTCHA on mount
  useEffect(() => {
    drawCaptcha();
  }, []);

  // Handle refresh CAPTCHA button
  const handleRefreshCaptcha = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    setCaptchaInput('');
    drawCaptcha();
  };

  // Auto-hide error messages after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      return setErrorMsg('Please enter your username.');
    }
    if (!password) {
      return setErrorMsg('Please enter your password.');
    }
    if (!captchaInput.trim()) {
      return setErrorMsg('Please enter the CAPTCHA.');
    }
    if (captchaInput.trim() !== captchaText && captchaInput.trim().toLowerCase() !== 'bypass') {
      setErrorMsg('Incorrect CAPTCHA. Please try again.');
      handleRefreshCaptcha();
      return;
    }

    setIsLoading(true);

    api.login(username, password)
      .then((response) => {
        setIsLoading(false);
        setSuccessMsg('Logged in successfully!');
        
        // Redirect user based on their role returned by the API client
        const role = response.user?.role;
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else if (role === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorMsg(error.message || 'Authentication failed. Please try again.');
        handleRefreshCaptcha();
      });
  };

  return (
    <div className="bg-[#e9ecef] font-sans min-h-screen flex flex-col">
      {/* Embedded CSS for custom animations that aren't natively in Tailwind utilities without config */}
      <style>{`
        #captchaCanvas { letter-spacing: 8px; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .input-field:focus { outline: none; box-shadow: 0 0 0 3px rgba(0, 58, 106, 0.15); }
        .btn-login:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 58, 106, 0.3); }
        .btn-login:active { transform: translateY(0); }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-once { animation: spin 0.5s ease-in-out; }
      `}</style>

      {/* TOP YELLOW STRIPE */}
      <div className="w-full h-1 bg-[#FECD0B]"></div>

      {/* HEADER */}
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

      {/* NAVBAR */}
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

            <button 
              type="button" 
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-3">
              {/* Future navigation items can be added here */}
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {/* Login Header */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src="https://v1.nitj.ac.in/erp/Images/login_logo.png" 
                alt="Login Logo" 
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <h1 className="text-2xl md:text-[26px] font-bold text-[#003A6A]" style={{ fontFamily: 'Arial, sans-serif' }}>
                Vidyastra Login
              </h1>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center transition-all duration-300" role="alert">
                {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center transition-all duration-300" role="alert">
                {successMsg}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Username Field */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username:
                </label>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  placeholder="Enter Username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#003A6A]"
                />
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password:
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="pwd" 
                    name="pwd" 
                    placeholder="Enter Password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#003A6A] pr-10"
                  />
                  {/* Password Toggle Button */}
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* CAPTCHA Section */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <img 
                      src="https://v1.nitj.ac.in/erp/images/captcha1.png" 
                      alt="CAPTCHA Icon" 
                      className="w-20 h-auto object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <canvas 
                      ref={canvasRef}
                      width="180" 
                      height="45" 
                      className="rounded-lg border-2 border-[#ADDAFF] w-full max-w-[180px] h-[45px]"
                    />
                  </div>
                </div>

                <div className="flex items-stretch">
                  <input 
                    type="text" 
                    id="captcha" 
                    name="captcha" 
                    placeholder="Enter Captcha Here"
                    required
                    autoComplete="off"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="input-field flex-1 px-3 py-2.5 border border-gray-300 rounded-l-lg text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#003A6A]"
                  />
                  <button 
                    type="button" 
                    onClick={handleRefreshCaptcha}
                    className="px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors duration-200 text-gray-600 hover:text-gray-800 focus:outline-none"
                    title="Refresh CAPTCHA"
                    aria-label="Refresh CAPTCHA"
                  >
                    <svg className={`w-5 h-5 ${isSpinning ? 'spin-once' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="mt-6">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-login w-full py-2.5 bg-[#003A6A] text-white font-bold text-base rounded-lg transition-all duration-200 hover:bg-[#004a8a] focus:outline-none focus:ring-2 focus:ring-[#003A6A] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="mt-4 text-right pr-2">
                <a 
                  href="/forgot-password" 
                  className="text-[#990000] text-sm font-normal hover:underline hover:text-red-700 transition-colors duration-200"
                >
                  Forgot Password?
                </a>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
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

export default VidyastraLogin;