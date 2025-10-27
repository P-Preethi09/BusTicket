import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Custom SVG Icons
  const BusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
      <path 
        d="M8 4C5.79086 4 4 5.79086 4 8V24C4 26.2091 5.79086 28 8 28H10C10 29.1046 10.8954 30 12 30C13.1046 30 14 29.1046 14 28H18C18 29.1046 18.8954 30 20 30C21.1046 30 22 29.1046 22 28H24C26.2091 28 28 26.2091 28 24V8C28 5.79086 26.2091 4 24 4H8Z" 
        fill="currentColor"
      />
      <path 
        d="M8 12C8 10.8954 8.89543 10 10 10H22C23.1046 10 24 10.8954 24 12V18C24 19.1046 23.1046 20 22 20H10C8.89543 20 8 19.1046 8 18V12Z" 
        fill="white"
      />
      <circle cx="10" cy="24" r="2" fill="currentColor"/>
      <circle cx="22" cy="24" r="2" fill="currentColor"/>
      <rect x="6" y="6" width="20" height="2" fill="currentColor"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path 
        d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M10 17L15 12L10 7" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <line 
        x1="15" 
        y1="12" 
        x2="3" 
        y2="12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );

  const MenuIcon = () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
      <rect x="4" y="8" width="24" height="2" rx="1" fill="currentColor"/>
      <rect x="4" y="15" width="24" height="2" rx="1" fill="currentColor"/>
      <rect x="4" y="22" width="24" height="2" rx="1" fill="currentColor"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
      <path 
        d="M8 8L24 24" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M24 8L8 24" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
    </svg>
  );

  const BookingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path 
        d="M19 3H18V2C18 1.44772 17.5523 1 17 1C16.4477 1 16 1.44772 16 2V3H8V2C8 1.44772 7.55228 1 7 1C6.44772 1 6 1.44772 6 2V3H5C3.34315 3 2 4.34315 2 6V20C2 21.6569 3.34315 23 5 23H19C20.6569 23 22 21.6569 22 20V6C22 4.34315 20.6569 3 19 3Z" 
        fill="currentColor"
      />
      <rect x="6" y="10" width="3" height="2" rx="1" fill="white"/>
      <rect x="11" y="10" width="3" height="2" rx="1" fill="white"/>
      <rect x="16" y="10" width="3" height="2" rx="1" fill="white"/>
      <rect x="6" y="14" width="3" height="2" rx="1" fill="white"/>
      <rect x="11" y="14" width="3" height="2" rx="1" fill="white"/>
      <rect x="16" y="14" width="3" height="2" rx="1" fill="white"/>
    </svg>
  );

  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/>
      <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"/>
      <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"/>
      <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/>
    </svg>
  );

  const VehicleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect x="2" y="8" width="20" height="12" rx="2" fill="currentColor"/>
      <circle cx="7" cy="18" r="2" fill="white"/>
      <circle cx="17" cy="18" r="2" fill="white"/>
      <path 
        d="M22 12H2M6 8V4C6 2.89543 6.89543 2 8 2H16C17.1046 2 18 2.89543 18 4V8" 
        stroke="currentColor" 
        strokeWidth="2"
      />
    </svg>
  );

  return (
    <nav className="bg-gradient-to-r from-[#19183B] via-[#19183B] to-[#708993] backdrop-blur-md shadow-2xl border-b-2 border-[#A1C2BD]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center space-x-4 group"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A1C2BD] to-[#E7F2EF] rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl border-2 border-[#E7F2EF]/50">
                <BusIcon />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-[#A1C2BD] to-[#E7F2EF] rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-[#E7F2EF] via-[#A1C2BD] to-[#E7F2EF] bg-clip-text text-transparent drop-shadow-sm">
                BoardEasy
              </span>
              <span className="text-xs text-[#A1C2BD] font-semibold -mt-1 tracking-wider">
                Travel Simplified
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">


            {isAuthenticated() && (
              <Link
                to={user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'DRIVER' ? '/driver/dashboard' : '/user/dashboard'}
                className="flex items-center space-x-2 px-5 py-3 text-[#E7F2EF] hover:text-[#19183B] hover:bg-[#E7F2EF] rounded-2xl transition-all duration-400 group font-semibold border border-[#708993]/30 hover:border-[#A1C2BD] hover:shadow-lg backdrop-blur-sm"
              >
                <DashboardIcon />
                <span className="text-sm tracking-wide">Dashboard</span>
              </Link>
            )}



            {/* Auth Section */}
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l-2 border-[#708993]/40">
              {!isAuthenticated() ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-5 py-3 text-[#E7F2EF] hover:text-[#19183B] hover:bg-[#E7F2EF] rounded-2xl transition-all duration-400 group font-semibold border border-[#708993]/30 hover:border-[#A1C2BD] hover:shadow-lg backdrop-blur-sm"
                  >
                    <UserIcon />
                    <span className="text-sm tracking-wide">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="px-7 py-3 bg-gradient-to-r from-[#A1C2BD] to-[#E7F2EF] text-[#19183B] font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-400 border-2 border-[#E7F2EF]/50 hover:from-[#E7F2EF] hover:to-[#A1C2BD]"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 px-4 py-2 bg-[#E7F2EF]/20 rounded-2xl border-2 border-[#A1C2BD]/40 backdrop-blur-sm hover:bg-[#E7F2EF]/30 transition-all duration-300"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      user?.role === 'ADMIN' ? 'bg-red-600' : 
                      user?.role === 'DRIVER' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-[#E7F2EF]">
                      {user?.username}
                    </span>
                    <svg className={`w-4 h-4 text-[#A1C2BD] transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            user?.role === 'ADMIN' ? 'bg-red-600' : 
                            user?.role === 'DRIVER' ? 'bg-green-600' : 'bg-blue-600'
                          }`}>
                            {user?.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user?.username}</p>
                            <p className="text-sm text-gray-500">{user?.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'DRIVER' ? '/driver/dashboard' : '/user/dashboard');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
                        </svg>
                        <span>Dashboard</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogoutIcon />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-2xl text-[#E7F2EF] hover:text-[#19183B] hover:bg-[#E7F2EF] transition-all duration-400 border-2 border-[#708993]/30 hover:border-[#A1C2BD] shadow-lg"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-18 left-0 right-0 bg-gradient-to-b from-[#19183B] to-[#708993] backdrop-blur-xl border-b-2 border-[#A1C2BD]/30 shadow-2xl">
            <div className="px-6 py-4 space-y-3">


              {isAuthenticated() && (
                <Link
                  to={user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'DRIVER' ? '/driver/dashboard' : '/user/dashboard'}
                  className="flex items-center space-x-4 px-5 py-4 text-[#E7F2EF] hover:text-[#19183B] hover:bg-[#E7F2EF] rounded-2xl transition-all duration-400 font-semibold border border-[#708993]/30 hover:border-[#A1C2BD] shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <DashboardIcon />
                  <span className="tracking-wide">Dashboard</span>
                </Link>
              )}



              {!isAuthenticated() ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-4 px-5 py-4 text-[#E7F2EF] hover:text-[#19183B] hover:bg-[#E7F2EF] rounded-2xl transition-all duration-400 font-semibold border border-[#708993]/30 hover:border-[#A1C2BD] shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon />
                    <span className="tracking-wide">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-4 px-5 py-4 bg-gradient-to-r from-[#A1C2BD] to-[#E7F2EF] text-[#19183B] rounded-2xl font-bold justify-center mt-3 shadow-xl border-2 border-[#E7F2EF]/50 hover:from-[#E7F2EF] hover:to-[#A1C2BD] transition-all duration-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="tracking-wide">Get Started</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4 px-5 py-4 bg-[#E7F2EF]/20 rounded-2xl border-2 border-[#A1C2BD]/40 backdrop-blur-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      user?.role === 'ADMIN' ? 'bg-red-600' : 
                      user?.role === 'DRIVER' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-[#E7F2EF]">
                      Hi, <span className="text-[#A1C2BD] font-bold">{user?.username}</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'DRIVER' ? '/driver/dashboard' : '/user/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-4 px-5 py-4 text-[#E7F2EF] hover:text-[#19183B] hover:bg-[#E7F2EF] rounded-2xl transition-all duration-400 font-semibold border border-[#708993]/30 hover:border-[#A1C2BD] shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
                    </svg>
                    <span className="tracking-wide">Dashboard</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-4 px-5 py-4 text-[#E7F2EF] hover:text-red-100 hover:bg-red-500/20 rounded-2xl transition-all duration-400 font-semibold w-full text-left border-2 border-red-400/30 hover:border-red-400 shadow-lg"
                  >
                    <LogoutIcon />
                    <span className="tracking-wide">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}