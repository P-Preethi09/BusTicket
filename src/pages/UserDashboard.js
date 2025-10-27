import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import '../styles/animations.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'PASSENGER') {
      navigate('/');
      return;
    }
    
    setUser(parsedUser);
    setProfileData({
      username: parsedUser.username,
      email: parsedUser.email,
      phone: parsedUser.phoneNumber || '',
      fullName: parsedUser.fullName || ''
    });
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const bookingsResponse = await api.get('/api/bookings/my-bookings');
      const bookingsData = bookingsResponse.data;
      setBookings(bookingsData);

      // Calculate stats
      const totalBookings = bookingsData.length;
      const confirmedBookings = bookingsData.filter(b => b.bookingStatus === 'CONFIRMED').length;
      const pendingBookings = bookingsData.filter(b => b.bookingStatus === 'PENDING').length;
      const totalSpent = bookingsData.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      setStats({
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/users/profile', profileData);
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditProfile(false);
      // Show success notification
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    try {
      await api.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('Failed to change password', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const showNotification = (message, type) => {
    // In a real app, you'd use a proper notification system
    alert(message);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const downloadTicket = (booking) => {
    const ticketContent = `
      BUS TICKET
      ==========
      
      PNR: ${booking.pnrNumber}
      Route: ${booking.schedule?.route?.source || 'N/A'} → ${booking.schedule?.route?.destination || 'N/A'}
      Travel Date: ${new Date(booking.travelDate).toLocaleDateString()}
      Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}
      Seats: ${booking.seatNumbers}
      Amount: ₹${booking.totalAmount}
      Status: ${getStatusText(booking.bookingStatus)}
      
      Passenger: ${user?.fullName || user?.username}
      Contact: ${user?.email}
      Phone: ${user?.phoneNumber || 'N/A'}
      
      Thank you for choosing our service!
    `;
    
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${booking.pnrNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-400 via-purple-500 to-pink-500 opacity-70 animate-gradient-y"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold drop-shadow-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden pt-18 ${isDark ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700' : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'} animate-gradient-x`}></div>
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-tl from-gray-800 via-gray-700 to-gray-600' : 'bg-gradient-to-tl from-blue-400 via-purple-500 to-pink-500'} opacity-70 animate-gradient-y`}></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-bounce delay-100"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300/30 rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300/25 rounded-full animate-bounce delay-500"></div>
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-green-300/30 rounded-full animate-pulse delay-700"></div>
      <div className="absolute bottom-32 right-1/3 w-18 h-18 bg-pink-300/25 rounded-full animate-bounce delay-200"></div>
      
      {/* Animated Shapes */}
      <div className="absolute top-20 left-1/3 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 animate-spin-slow"></div>
      <div className="absolute bottom-40 right-1/4 w-28 h-28 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-25 animate-pulse"></div>
      
      <div className="relative z-10 flex h-[calc(100vh-4.5rem)]">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden fixed top-20 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white shadow-lg text-blue-600 p-3 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Sidebar */}
        <div className={`
          w-80 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'} shadow-2xl border-r transform transition-transform duration-300 flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative top-0 bottom-0 left-0 z-40 lg:z-auto
        `}>
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-8 border-b border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4 shadow-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-4 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user?.fullName || user?.username}</h2>
              <p className="text-blue-100 text-sm">{user?.email}</p>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-xs font-medium">Passenger</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {[
              { 
                id: 'overview', 
                name: 'Dashboard Overview', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                description: 'Your travel summary'
              },
              { 
                id: 'bookings', 
                name: 'My Bookings', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                ),
                description: 'Booking history & details'
              },
              { 
                id: 'profile', 
                name: 'Profile Settings', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                description: 'Manage your profile'
              },
              { 
                id: 'settings', 
                name: 'Account Security', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                description: 'Password & preferences'
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 shadow-md border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}>
                    {tab.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{tab.name}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                  {activeTab === tab.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-6 border-t border-red-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border border-transparent hover:border-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-red-100'} shadow-sm border-b p-6`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'bookings' && 'My Bookings'}
                {activeTab === 'profile' && 'Profile Settings'}
                {activeTab === 'settings' && 'Account Security'}
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.username}! Here's your travel summary.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-xl"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <div className="hidden md:flex items-center gap-3 bg-green-50 rounded-full px-4 py-2 border border-green-200">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Total Bookings',
                    value: stats.totalBookings,
                    change: '+12%',
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ),
                    bgColor: 'bg-blue-500',
                    description: 'All time bookings'
                  },
                  {
                    title: 'Confirmed',
                    value: stats.confirmedBookings,
                    change: '+8%',
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    bgColor: 'bg-green-500',
                    description: 'Successful trips'
                  },
                  {
                    title: 'Pending',
                    value: stats.pendingBookings,
                    change: '-3%',
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    bgColor: 'bg-yellow-500',
                    description: 'Awaiting confirmation'
                  },
                  {
                    title: 'Total Spent',
                    value: `₹${stats.totalSpent}`,
                    change: '+15%',
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    ),
                    bgColor: 'bg-red-500',
                    description: 'Lifetime spending'
                  }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center text-white`}>
                        {stat.icon}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        stat.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-gray-500 text-xs mt-2">{stat.description}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold transition-colors flex items-center gap-1"
                    >
                      View All 
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {bookings.slice(0, 4).map((booking) => (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 hover:border-red-200 transition-all duration-300 group cursor-pointer hover:shadow-md"
                        onClick={() => setActiveTab('bookings')}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.bookingStatus)}`}></div>
                          <div>
                            <div className="text-gray-800 font-semibold">
                              {booking.schedule?.route?.source} → {booking.schedule?.route?.destination}
                            </div>
                            <div className="text-gray-600 text-sm">
                              PNR: {booking.pnrNumber} • {new Date(booking.bookingDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-800 font-bold">₹{booking.totalAmount}</div>
                          <div className={`text-xs font-semibold ${
                            booking.bookingStatus === 'CONFIRMED' ? 'text-green-600' :
                            booking.bookingStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {getStatusText(booking.bookingStatus)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 hover:border-red-200 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-gray-800 font-semibold">Book New Trip</div>
                        <div className="text-gray-600 text-sm">Find buses & routes</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-gray-800 font-semibold">Update Profile</div>
                        <div className="text-gray-600 text-sm">Edit personal info</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActiveTab('settings')}
                      className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-gray-800 font-semibold">Security</div>
                        <div className="text-gray-600 text-sm">Change password</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600">
                <h3 className="text-xl font-bold text-white">Booking History</h3>
                <p className="text-red-100 mt-1">Manage and view all your bus bookings</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left p-6 text-gray-700 font-semibold text-sm">TRIP DETAILS</th>
                      <th className="text-left p-6 text-gray-700 font-semibold text-sm">SEATS</th>
                      <th className="text-left p-6 text-gray-700 font-semibold text-sm">AMOUNT</th>
                      <th className="text-left p-6 text-gray-700 font-semibold text-sm">STATUS</th>
                      <th className="text-left p-6 text-gray-700 font-semibold text-sm">DATE</th>
                      <th className="text-left p-6 text-gray-700 font-semibold text-sm">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-50 hover:bg-red-50 transition-colors">
                        <td className="p-6">
                          <div className="text-gray-800 font-semibold">
                            {booking.schedule?.route?.source} → {booking.schedule?.route?.destination}
                          </div>
                          <div className="text-gray-600 text-sm mt-1">PNR: {booking.pnrNumber}</div>
                        </td>
                        <td className="p-6">
                          <div className="text-gray-800">{booking.seatNumbers}</div>
                        </td>
                        <td className="p-6">
                          <div className="text-gray-800 font-bold">₹{booking.totalAmount}</div>
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.bookingStatus === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-700'
                              : booking.bookingStatus === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              booking.bookingStatus === 'CONFIRMED' ? 'bg-green-500' :
                              booking.bookingStatus === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            {getStatusText(booking.bookingStatus)}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="text-gray-600 text-sm">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => downloadTicket(booking)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                  <button
                    onClick={() => setEditProfile(!editProfile)}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors font-semibold"
                  >
                    {editProfile ? 'Cancel Editing' : 'Edit Profile'}
                  </button>
                </div>

                {editProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-3">Username</label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300"
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-3">Email Address</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-3">Full Name</label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-3">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Username</label>
                        <p className="text-gray-800 text-lg">{user?.username}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                        <p className="text-gray-800 text-lg">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                        <p className="text-gray-800 text-lg">{user?.fullName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
                        <p className="text-gray-800 text-lg">{user?.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="text-lg font-bold text-gray-800 mb-6">Profile Completion</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Basic Info</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>

                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Contact Details</span>
                    <span>{user?.phoneNumber ? '100%' : '50%'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: user?.phoneNumber ? '100%' : '50%' }}></div>
                  </div>

                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Profile Picture</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full w-0"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold mt-4"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="text-gray-800 font-semibold">Email Notifications</h4>
                      <p className="text-gray-600 text-sm">Booking confirmations and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="text-gray-800 font-semibold">SMS Notifications</h4>
                      <p className="text-gray-600 text-sm">SMS alerts for bookings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="text-gray-800 font-semibold">Promotional Emails</h4>
                      <p className="text-gray-600 text-sm">Special offers and discounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;