import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import RouteForm from '../components/RouteForm';
import ScheduleForm from '../components/ScheduleForm';
import '../styles/animations.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [payments, setPayments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeRoutes: 0,
    avgOccupancy: 0,
    topRoutes: [],
    recentActivity: []
  });
  const [notifications, setNotifications] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    database: 98.5,
    api: 99.2,
    payment: 97.8,
    notifications: 99.9
  });

  // Pagination, Sorting, and Filtering states
  const [userFilters, setUserFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'username',
    sortOrder: 'asc',
    page: 0,
    size: 10
  });
  const [vehicleFilters, setVehicleFilters] = useState({
    search: '',
    operator: 'all',
    type: 'all',
    status: 'all',
    sortBy: 'vehicleNumber',
    sortOrder: 'asc',
    page: 0,
    size: 10
  });
  const [routeFilters, setRouteFilters] = useState({
    search: '',
    sortBy: 'source',
    sortOrder: 'asc',
    page: 0,
    size: 10
  });
  const [userPagination, setUserPagination] = useState({ totalPages: 0, totalElements: 0 });
  const [vehiclePagination, setVehiclePagination] = useState({ totalPages: 0, totalElements: 0 });
  const [routePagination, setRoutePagination] = useState({ totalPages: 0, totalElements: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    
    setUser(parsedUser);
    setProfileData({
      username: parsedUser.username,
      email: parsedUser.email,
      phone: parsedUser.phone || parsedUser.phoneNumber || '',
      fullName: parsedUser.fullName || ''
    });
    fetchAdminData();
  }, [navigate]);

  // Memoized filtered data to prevent infinite re-renders
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = !userFilters.search || 
        user.username?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(userFilters.search.toLowerCase());
      const matchesRole = userFilters.role === 'all' || user.role === userFilters.role;
      const matchesStatus = userFilters.status === 'all' || 
        (userFilters.status === 'active' ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[userFilters.sortBy]?.toString().toLowerCase() || '';
      const bVal = b[userFilters.sortBy]?.toString().toLowerCase() || '';
      return userFilters.sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    // Paginate
    const start = userFilters.page * userFilters.size;
    return filtered.slice(start, start + userFilters.size);
  }, [users, userFilters]);

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      const matchesSearch = !vehicleFilters.search || 
        vehicle.vehicleNumber?.toLowerCase().includes(vehicleFilters.search.toLowerCase()) ||
        vehicle.operator?.toLowerCase().includes(vehicleFilters.search.toLowerCase());
      const matchesOperator = vehicleFilters.operator === 'all' || vehicle.operator === vehicleFilters.operator;
      const matchesType = vehicleFilters.type === 'all' || vehicle.vehicleType === vehicleFilters.type;
      return matchesSearch && matchesOperator && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[vehicleFilters.sortBy]?.toString().toLowerCase() || '';
      const bVal = b[vehicleFilters.sortBy]?.toString().toLowerCase() || '';
      return vehicleFilters.sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    // Paginate
    const start = vehicleFilters.page * vehicleFilters.size;
    return filtered.slice(start, start + vehicleFilters.size);
  }, [vehicles, vehicleFilters]);

  const filteredRoutes = useMemo(() => {
    let filtered = routes.filter(route => {
      const matchesSearch = !routeFilters.search || 
        route.source?.toLowerCase().includes(routeFilters.search.toLowerCase()) ||
        route.destination?.toLowerCase().includes(routeFilters.search.toLowerCase());
      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (routeFilters.sortBy === 'distanceKm') {
        aVal = a[routeFilters.sortBy] || 0;
        bVal = b[routeFilters.sortBy] || 0;
        return routeFilters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      } else {
        aVal = a[routeFilters.sortBy]?.toString().toLowerCase() || '';
        bVal = b[routeFilters.sortBy]?.toString().toLowerCase() || '';
        return routeFilters.sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
    });

    // Paginate
    const start = routeFilters.page * routeFilters.size;
    return filtered.slice(start, start + routeFilters.size);
  }, [routes, routeFilters]);

  // Update pagination info when filtered data changes
  useEffect(() => {
    const userFiltered = users.filter(user => {
      const matchesSearch = !userFilters.search || 
        user.username?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(userFilters.search.toLowerCase());
      const matchesRole = userFilters.role === 'all' || user.role === userFilters.role;
      const matchesStatus = userFilters.status === 'all' || 
        (userFilters.status === 'active' ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
    const totalElements = userFiltered.length;
    const totalPages = Math.ceil(totalElements / userFilters.size);
    setUserPagination({ totalPages, totalElements });
  }, [users, userFilters]);

  useEffect(() => {
    const vehicleFiltered = vehicles.filter(vehicle => {
      const matchesSearch = !vehicleFilters.search || 
        vehicle.vehicleNumber?.toLowerCase().includes(vehicleFilters.search.toLowerCase()) ||
        vehicle.operator?.toLowerCase().includes(vehicleFilters.search.toLowerCase());
      const matchesOperator = vehicleFilters.operator === 'all' || vehicle.operator === vehicleFilters.operator;
      const matchesType = vehicleFilters.type === 'all' || vehicle.vehicleType === vehicleFilters.type;
      return matchesSearch && matchesOperator && matchesType;
    });
    const totalElements = vehicleFiltered.length;
    const totalPages = Math.ceil(totalElements / vehicleFilters.size);
    setVehiclePagination({ totalPages, totalElements });
  }, [vehicles, vehicleFilters]);

  useEffect(() => {
    const routeFiltered = routes.filter(route => {
      const matchesSearch = !routeFilters.search || 
        route.source?.toLowerCase().includes(routeFilters.search.toLowerCase()) ||
        route.destination?.toLowerCase().includes(routeFilters.search.toLowerCase());
      return matchesSearch;
    });
    const totalElements = routeFiltered.length;
    const totalPages = Math.ceil(totalElements / routeFilters.size);
    setRoutePagination({ totalPages, totalElements });
  }, [routes, routeFilters]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    
    // Fetch each API separately to avoid one failure breaking everything
    
    // Fetch users
    try {
      const usersResponse = await api.get('/api/admin/users');
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
    } catch (error) {
      console.log('Users API failed:', error);
      setUsers([]);
    }
    
    // Fetch vehicles
    try {
      const vehiclesResponse = await api.get('/api/vehicles?size=1000');
      console.log('Vehicles API Response:', vehiclesResponse.data);
      
      const vehiclesData = vehiclesResponse.data;
      if (vehiclesData && vehiclesData.content) {
        console.log('Setting vehicles from content:', vehiclesData.content);
        setVehicles(Array.isArray(vehiclesData.content) ? vehiclesData.content : []);
      } else {
        console.log('Setting vehicles directly:', vehiclesData);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      }
    } catch (error) {
      console.log('Vehicles API failed:', error);
      setVehicles([]);
    }
    
    // Fetch routes
    try {
      const routesResponse = await api.get('/api/routes?size=1000');
      const routesData = routesResponse.data;
      if (routesData && routesData.content) {
        setRoutes(Array.isArray(routesData.content) ? routesData.content : []);
      } else {
        setRoutes(Array.isArray(routesData) ? routesData : []);
      }
    } catch (error) {
      console.log('Routes API failed:', error);
      setRoutes([]);
    }
    
    // Fetch schedules
    try {
      const schedulesResponse = await api.get('/api/schedules?size=1000');
      const schedulesData = schedulesResponse.data;
      if (schedulesData && schedulesData.content) {
        setSchedules(Array.isArray(schedulesData.content) ? schedulesData.content : []);
      } else {
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      }
    } catch (error) {
      console.log('Schedules API failed:', error);
      setSchedules([]);
    }
    
    // Fetch drivers
    try {
      const driversResponse = await api.get('/api/admin/users/drivers');
      setDrivers(Array.isArray(driversResponse.data) ? driversResponse.data : []);
    } catch (error) {
      console.log('Drivers API failed:', error);
      setDrivers([]);
    }
    
    // Fetch bookings
    try {
      const bookingsResponse = await api.get('/api/bookings?size=1000');
      const bookingsData = bookingsResponse.data;
      if (bookingsData && bookingsData.content) {
        setBookings(Array.isArray(bookingsData.content) ? bookingsData.content : []);
      } else {
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch (error) {
      console.log('Bookings API failed:', error);
      setBookings([]);
    }
    
    // Fetch payments
    try {
      const paymentsResponse = await api.get('/api/payments?size=1000');
      const paymentsData = paymentsResponse.data;
      if (paymentsData && paymentsData.content) {
        setPayments(Array.isArray(paymentsData.content) ? paymentsData.content : []);
      } else {
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      }
    } catch (error) {
      console.log('Payments API failed:', error);
      setPayments([]);
    }
    
    setLoading(false);
    calculateAnalytics();
  };

  const calculateAnalytics = () => {
    // Calculate real analytics from fetched data
    const totalRevenue = payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const activeRoutes = routes.length;
    const totalCapacity = vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);
    const totalBookings = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
    const avgOccupancy = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0;
    
    // Calculate top routes by bookings
    const routeStats = routes.map(route => {
      const routeBookings = bookings.filter(b => 
        b.schedule?.route?.id === route.id && b.bookingStatus === 'CONFIRMED'
      );
      const routeRevenue = routeBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
      return {
        route: `${route.source} → ${route.destination}`,
        bookings: routeBookings.length,
        revenue: routeRevenue
      };
    }).sort((a, b) => b.bookings - a.bookings).slice(0, 3);
    
    // Generate recent activity from real data
    const recentActivity = [];
    if (bookings.length > 0) {
      const latestBooking = bookings[bookings.length - 1];
      recentActivity.push({
        type: 'booking',
        message: `New booking ${latestBooking.pnrNumber} - ${latestBooking.schedule?.route?.source} to ${latestBooking.schedule?.route?.destination}`,
        time: 'Recently',
        status: 'success'
      });
    }
    if (drivers.length > 0) {
      recentActivity.push({
        type: 'driver',
        message: `${drivers.length} drivers registered in system`,
        time: 'System status',
        status: 'info'
      });
    }
    if (vehicles.length > 0) {
      recentActivity.push({
        type: 'fleet',
        message: `${vehicles.length} vehicles in active fleet`,
        time: 'Fleet status',
        status: 'info'
      });
    }
    
    setAnalytics({
      totalRevenue,
      monthlyGrowth: totalRevenue > 0 ? 12.5 : 0, // Mock growth rate
      activeRoutes,
      avgOccupancy: Math.round(avgOccupancy * 10) / 10,
      topRoutes: routeStats,
      recentActivity
    });
  };

  const assignDriver = async (vehicleId, driverId) => {
    try {
      const response = await api.put(`/api/admin/vehicles/${vehicleId}/assign-driver/${driverId}`);
      await fetchAdminData(); // Refresh data
      
      // Find the vehicle and driver names for the success message
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const driver = drivers.find(d => d.id === parseInt(driverId));
      
      alert(`Driver ${driver?.username || 'Unknown'} successfully assigned to vehicle ${vehicle?.vehicleNumber || 'Unknown'}!`);
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver. Please try again.');
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      await api.put(`/api/admin/users/${userId}/${endpoint}`);
      fetchAdminData();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
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
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      await api.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-white to-blue-600 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-white via-blue-100 to-blue-500 opacity-70 animate-gradient-y"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold drop-shadow-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700' : 'bg-gradient-to-br from-blue-400 via-white to-blue-600'} animate-gradient-x`}></div>
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-tl from-gray-800 via-gray-700 to-gray-600' : 'bg-gradient-to-tl from-white via-blue-100 to-blue-500'} opacity-70 animate-gradient-y`}></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-bounce delay-100"></div>
      <div className="absolute top-60 right-32 w-24 h-24 bg-yellow-300/20 rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-pink-300/15 rounded-full animate-bounce delay-500"></div>
      
      <div className="relative z-10">
      {/* Enhanced Header */}
      <div className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg shadow-xl border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Welcome back, {user?.fullName || user?.username}
                </h1>
                <p className="text-lg text-gray-600 flex items-center mt-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  System Administrator • BoardEasy Control Center
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-3 text-gray-600 hover:text-blue-600 transition-colors bg-white rounded-xl shadow-md hover:shadow-lg"
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
              
              {/* Notification Bell */}
              <div className="relative">
                <button className="p-3 text-gray-600 hover:text-blue-600 transition-colors bg-white rounded-xl shadow-md hover:shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM8.5 14.5a6 6 0 110-12 6 6 0 010 12z" />
                  </svg>

                </button>
              </div>
              
              {/* System Health Indicator */}
              <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-md">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">System Healthy</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 ${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg shadow-xl border-r min-h-screen`}>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.fullName || user?.username}</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>System Administrator</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {[
                { 
                  id: 'overview', 
                  name: 'Dashboard', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                },
                { 
                  id: 'analytics', 
                  name: 'Analytics', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                },
                { 
                  id: 'bookings', 
                  name: 'All Bookings', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                },
                { 
                  id: 'users', 
                  name: 'Users', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                },
                { 
                  id: 'vehicles', 
                  name: 'Fleet', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                },
                { 
                  id: 'routes', 
                  name: 'Routes', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                },
                { 
                  id: 'schedules', 
                  name: 'Schedules', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                },
                { 
                  id: 'payments', 
                  name: 'Payments', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                },
                { 
                  id: 'system', 
                  name: 'System Health', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                },
                { 
                  id: 'profile', 
                  name: 'Profile', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center py-3 px-4 font-medium text-sm rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                      : `${isDark ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

        {/* Enhanced Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold mt-2">{users.length}</p>
                    <p className="text-blue-100 text-xs mt-1">+12% from last month</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Drivers</p>
                    <p className="text-3xl font-bold mt-2">{drivers.length}</p>
                    <p className="text-green-100 text-xs mt-1">+8% from last month</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Fleet Size</p>
                    <p className="text-3xl font-bold mt-2">{vehicles.length}</p>
                    <p className="text-purple-100 text-xs mt-1">+5% from last month</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Monthly Revenue</p>
                    <p className="text-3xl font-bold mt-2">₹{(analytics.totalRevenue / 100000).toFixed(1)}L</p>
                    <p className="text-orange-100 text-xs mt-1">+{analytics.monthlyGrowth}% growth</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Live Activity Feed
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        } animate-pulse`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => navigate('/admin/bookings')}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span className="text-sm font-medium">Bookings</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium">Analytics</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span className="text-sm font-medium">Users</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('system')}
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Revenue Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">₹{(analytics.totalRevenue / 100000).toFixed(1)}L</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{analytics.monthlyGrowth}%</p>
                      <p className="text-sm text-gray-600">Monthly Growth</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Routes</span>
                      <span className="font-semibold">{analytics.activeRoutes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Occupancy</span>
                      <span className="font-semibold">{analytics.avgOccupancy}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Routes</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.topRoutes.map((route, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{route.route}</p>
                          <p className="text-sm text-gray-600">{route.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">₹{(route.revenue / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="40" cy="40" r="36" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - analytics.avgOccupancy / 100)}`} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{analytics.avgOccupancy}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="40" cy="40" r="36" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 92 / 100)}`} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">92%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">On-Time Performance</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="40" cy="40" r="36" stroke="#f59e0b" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 87 / 100)}`} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">87%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="40" cy="40" r="36" stroke="#ef4444" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 95 / 100)}`} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">95%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <div className="space-y-8">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(systemHealth).map(([system, health]) => (
                <div key={system} className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 capitalize">{system}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      health > 98 ? 'bg-green-500' : health > 95 ? 'bg-yellow-500' : 'bg-red-500'
                    } animate-pulse`}></div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{health}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {health > 98 ? 'Excellent' : health > 95 ? 'Good' : 'Needs Attention'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          health > 98 ? 'bg-green-500' : health > 95 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${health}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notifications Panel */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">System Notifications</h3>
              </div>
              <div className="p-6">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM8.5 14.5a6 6 0 110-12 6 6 0 010 12z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No system notifications</p>
                    <p className="text-gray-400 text-sm mt-2">System notifications will appear here when available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`flex items-start space-x-4 p-4 rounded-xl border-l-4 ${
                        notification.type === 'urgent' ? 'border-l-red-500 bg-red-50' :
                        notification.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                        'border-l-blue-500 bg-blue-50'
                      } ${!notification.read ? 'ring-2 ring-opacity-20 ring-current' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'urgent' ? 'bg-red-100 text-red-600' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {notification.type === 'urgent' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-gray-400 text-sm mt-2">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Management Tab */}
        {activeTab === 'vehicles' && (
          <div className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg rounded-2xl shadow-xl border`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Fleet Management</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage vehicles and assign drivers</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Total: {vehiclePagination.totalElements} vehicles</p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
            
            {/* Vehicle Filters */}
            <div className={`px-6 py-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={vehicleFilters.search}
                  onChange={(e) => setVehicleFilters({...vehicleFilters, search: e.target.value, page: 0})}
                  className={`px-3 py-2 border rounded-md text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                />
                <select
                  value={vehicleFilters.operator}
                  onChange={(e) => setVehicleFilters({...vehicleFilters, operator: e.target.value, page: 0})}
                  className={`px-3 py-2 border rounded-md text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                >
                  <option value="all">All Operators</option>
                  {[...new Set(vehicles.map(v => v.operator).filter(Boolean))].map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <select
                  value={vehicleFilters.type}
                  onChange={(e) => setVehicleFilters({...vehicleFilters, type: e.target.value, page: 0})}
                  className={`px-3 py-2 border rounded-md text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                >
                  <option value="all">All Types</option>
                  {[...new Set(vehicles.map(v => v.vehicleType).filter(Boolean))].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={`${vehicleFilters.sortBy}-${vehicleFilters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setVehicleFilters({...vehicleFilters, sortBy, sortOrder});
                  }}
                  className={`px-3 py-2 border rounded-md text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                >
                  <option value="vehicleNumber-asc">Vehicle Number A-Z</option>
                  <option value="vehicleNumber-desc">Vehicle Number Z-A</option>
                  <option value="operator-asc">Operator A-Z</option>
                  <option value="vehicleType-asc">Type A-Z</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Vehicle Details
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Operator
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Current Driver
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Assign Driver
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                            <p className="text-lg font-medium">No vehicles registered</p>
                            <p className="text-sm">Vehicles will appear here once operators register them</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 ${isDark ? 'bg-gray-700' : 'bg-blue-100'} rounded-lg flex items-center justify-center mr-4`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {vehicle.vehicleNumber}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {vehicle.vehicleType} • {vehicle.capacity} seats
                                </p>
                                {vehicle.vehicleName && (
                                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {vehicle.vehicleName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 ${isDark ? 'bg-gray-700' : 'bg-green-100'} rounded-full flex items-center justify-center mr-3`}>
                                <svg className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {vehicle.operator || 'Unknown Operator'}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Bus Operator
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {vehicle.driver ? (
                              <div className="flex items-center">
                                <div className={`w-8 h-8 ${isDark ? 'bg-gray-700' : 'bg-blue-100'} rounded-full flex items-center justify-center mr-3`}>
                                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-blue-600'}`}>
                                    {vehicle.driver.username?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {vehicle.driver.username}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {vehicle.driver.fullName || 'Driver'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className={`w-8 h-8 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center mr-3`}>
                                  <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Not Assigned</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignDriver(vehicle.id, e.target.value);
                                  e.target.value = ''; // Reset selection
                                }
                              }}
                              className={`${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                              defaultValue=""
                            >
                              <option value="">Select Driver</option>
                              {drivers.filter(driver => 
                                // Show drivers that are not assigned to any vehicle OR assigned to current vehicle
                                !vehicles.some(v => v.driver?.id === driver.id && v.id !== vehicle.id)
                              ).map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.username} - {driver.fullName || 'Driver'}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              vehicle.driver 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {vehicle.driver ? 'Assigned' : 'Available'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg rounded-2xl shadow-xl border`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>All System Bookings</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>PNR</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Passenger</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Route</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Vehicle</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">No bookings found</p>
                            <p className="text-sm">Bookings will appear here once users start making reservations</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{booking.pnrNumber}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{booking.user?.username || 'N/A'}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {booking.schedule?.route?.source} → {booking.schedule?.route?.destination}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {booking.schedule?.vehicle?.vehicleNumber || 'N/A'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>₹{booking.totalAmount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              booking.bookingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Vehicle Pagination */}
              {vehiclePagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Showing {vehicleFilters.page * vehicleFilters.size + 1} to {Math.min((vehicleFilters.page + 1) * vehicleFilters.size, vehiclePagination.totalElements)} of {vehiclePagination.totalElements} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setVehicleFilters({...vehicleFilters, page: vehicleFilters.page - 1})}
                      disabled={vehicleFilters.page === 0}
                      className={`px-3 py-1 border rounded text-sm disabled:opacity-50 ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300'}`}
                    >
                      Previous
                    </button>
                    {[...Array(vehiclePagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setVehicleFilters({...vehicleFilters, page: i})}
                        className={`px-3 py-1 border rounded text-sm ${
                          vehicleFilters.page === i 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setVehicleFilters({...vehicleFilters, page: vehicleFilters.page + 1})}
                      disabled={vehicleFilters.page >= vehiclePagination.totalPages - 1}
                      className={`px-3 py-1 border rounded text-sm disabled:opacity-50 ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Routes Management Tab */}
        {activeTab === 'routes' && (
          <div className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg rounded-2xl shadow-xl border`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Routes Management</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage bus routes and destinations</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Total: {routePagination.totalElements} routes</p>
                </div>
                <button
                  onClick={() => setShowRouteForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Route
                </button>
              </div>
            </div>
            
            {/* Route Filters */}
            <div className={`px-6 py-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search routes..."
                  value={routeFilters.search}
                  onChange={(e) => setRouteFilters({...routeFilters, search: e.target.value, page: 0})}
                  className={`px-3 py-2 border rounded-md text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                />
                <select
                  value={`${routeFilters.sortBy}-${routeFilters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setRouteFilters({...routeFilters, sortBy, sortOrder});
                  }}
                  className={`px-3 py-2 border rounded-md text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                >
                  <option value="source-asc">Source A-Z</option>
                  <option value="source-desc">Source Z-A</option>
                  <option value="destination-asc">Destination A-Z</option>
                  <option value="destination-desc">Destination Z-A</option>
                  <option value="distanceKm-asc">Distance (Low to High)</option>
                  <option value="distanceKm-desc">Distance (High to Low)</option>
                </select>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                  Showing {routeFilters.page * routeFilters.size + 1} to {Math.min((routeFilters.page + 1) * routeFilters.size, routePagination.totalElements)} of {routePagination.totalElements}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Route</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Distance</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Duration</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredRoutes.length === 0 ? (
                      <tr>
                        <td colSpan="4" className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <p className="text-lg font-medium">No routes configured</p>
                            <p className="text-sm">Routes will appear here once they are added to the system</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRoutes.map((route) => (
                        <tr key={route.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-blue-100'} rounded-lg flex items-center justify-center mr-4`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {route.source} → {route.destination}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Route ID: {route.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {route.distanceKm} km
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}m
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Routes Pagination */}
              {routePagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-6 pb-6">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Showing {routeFilters.page * routeFilters.size + 1} to {Math.min((routeFilters.page + 1) * routeFilters.size, routePagination.totalElements)} of {routePagination.totalElements} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setRouteFilters({...routeFilters, page: routeFilters.page - 1})}
                      disabled={routeFilters.page === 0}
                      className={`px-3 py-1 border rounded text-sm disabled:opacity-50 ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300'}`}
                    >
                      Previous
                    </button>
                    {[...Array(routePagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setRouteFilters({...routeFilters, page: i})}
                        className={`px-3 py-1 border rounded text-sm ${
                          routeFilters.page === i 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setRouteFilters({...routeFilters, page: routeFilters.page + 1})}
                      disabled={routeFilters.page >= routePagination.totalPages - 1}
                      className={`px-3 py-1 border rounded text-sm disabled:opacity-50 ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedules Management Tab */}
        {activeTab === 'schedules' && (
          <div className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg rounded-2xl shadow-xl border`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Schedules Management</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>View and manage bus schedules</p>
                </div>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Schedule
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Route</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Operator</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Timing</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Price</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Seats</th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {schedules.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium">No schedules found</p>
                            <p className="text-sm">Schedules will appear here once vehicles are assigned to routes</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      schedules.map((schedule) => (
                        <tr key={schedule.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-purple-100'} rounded-lg flex items-center justify-center mr-4`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {schedule.route?.source} → {schedule.route?.destination}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {schedule.scheduleDate}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {schedule.vehicle?.operator || 'Unknown Operator'}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {schedule.vehicle?.vehicleNumber || 'N/A'} • {schedule.vehicle?.vehicleType || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {schedule.departureTime} - {schedule.arrivalTime}
                              </p>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            ₹{schedule.basePrice}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {schedule.availableSeats} available
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Management Tab */}
        {activeTab === 'payments' && (
          <div className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg rounded-2xl shadow-xl border`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payments Management</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>View and manage payment transactions</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Transaction ID</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Booking ID</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Payment Method</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium">No payments found</p>
                            <p className="text-sm">Payment transactions will appear here once users make bookings</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-green-100'} rounded-lg flex items-center justify-center mr-4`}>
                                <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {payment.transactionId || 'N/A'}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Payment ID: {payment.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            #{payment.bookingId || 'N/A'}
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            ₹{payment.amount || '0.00'}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {payment.paymentMethod || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                              payment.status === 'REFUNDED' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <div className="text-sm text-gray-500">
                  {userPagination.totalElements} total users
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({...userFilters, search: e.target.value, page: 0})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <select
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({...userFilters, role: e.target.value, page: 0})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="PASSENGER">Passenger</option>
                  <option value="DRIVER">Driver</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select
                  value={userFilters.status}
                  onChange={(e) => setUserFilters({...userFilters, status: e.target.value, page: 0})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={`${userFilters.sortBy}-${userFilters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setUserFilters({...userFilters, sortBy, sortOrder});
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="username-asc">Username A-Z</option>
                  <option value="username-desc">Username Z-A</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="role-asc">Role A-Z</option>
                </select>
              </div>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => setUserFilters({...userFilters, sortBy: 'username', sortOrder: userFilters.sortOrder === 'asc' ? 'desc' : 'asc'})}>
                        Username {userFilters.sortBy === 'username' && (userFilters.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => setUserFilters({...userFilters, sortBy: 'email', sortOrder: userFilters.sortOrder === 'asc' ? 'desc' : 'asc'})}>
                        Email {userFilters.sortBy === 'email' && (userFilters.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'DRIVER' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              user.isActive 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {userPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {userFilters.page * userFilters.size + 1} to {Math.min((userFilters.page + 1) * userFilters.size, userPagination.totalElements)} of {userPagination.totalElements} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setUserFilters({...userFilters, page: userFilters.page - 1})}
                      disabled={userFilters.page === 0}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(userPagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setUserFilters({...userFilters, page: i})}
                        className={`px-3 py-1 border rounded text-sm ${
                          userFilters.page === i ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setUserFilters({...userFilters, page: userFilters.page + 1})}
                      disabled={userFilters.page >= userPagination.totalPages - 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Administrator Profile</h3>
                <button
                  onClick={() => setEditProfile(!editProfile)}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  {editProfile ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            </div>
            <div className="p-6">
              {editProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProfile(false)}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-4">Personal Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-red-700 font-medium">Full Name</label>
                          <p className="text-red-900 font-semibold">{user?.fullName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-red-700 font-medium">Username</label>
                          <p className="text-red-900 font-semibold">{user?.username}</p>
                        </div>
                        <div>
                          <label className="text-sm text-red-700 font-medium">Phone</label>
                          <p className="text-red-900 font-semibold">{user?.phone || user?.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-4">Account Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-blue-700 font-medium">Email Address</label>
                          <p className="text-blue-900 font-semibold">{user?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-blue-700 font-medium">Role</label>
                          <p className="text-blue-900 font-semibold">System Administrator</p>
                        </div>
                        <div>
                          <label className="text-sm text-blue-700 font-medium">Status</label>
                          <p className="text-blue-900 font-semibold">Active • Verified</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-4">Access Permissions</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-green-700 font-medium">User Management</label>
                          <p className="text-green-900 font-semibold">Full Access</p>
                        </div>
                        <div>
                          <label className="text-sm text-green-700 font-medium">System Settings</label>
                          <p className="text-green-900 font-semibold">Full Access</p>
                        </div>
                        <div>
                          <label className="text-sm text-green-700 font-medium">Analytics</label>
                          <p className="text-green-900 font-semibold">Full Access</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Security Settings</h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legacy Settings Tab - keeping for backward compatibility */}
        {activeTab === 'settings' && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-yellow-800">System Configuration</h4>
                      <p className="text-yellow-700 text-sm">Advanced settings are available in the Profile tab</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left"
                  >
                    <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h4 className="font-semibold text-lg mb-2">Profile Settings</h4>
                    <p className="text-sm opacity-90">Manage your account and security</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('system')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left"
                  >
                    <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h4 className="font-semibold text-lg mb-2">System Health</h4>
                    <p className="text-sm opacity-90">Monitor system performance</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
      
      {/* Route Form Modal */}
      {showRouteForm && (
        <RouteForm
          onRouteAdded={fetchAdminData}
          onClose={() => setShowRouteForm(false)}
        />
      )}
      
      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <ScheduleForm
          onScheduleAdded={fetchAdminData}
          onClose={() => setShowScheduleForm(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;