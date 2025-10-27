import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/animations.css';

const BookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live-bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, routesRes, vehiclesRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/routes'),
        api.get('/api/vehicles')
      ]);
      
      setBookings(bookingsRes.data);
      setRoutes(routesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Error fetching booking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await api.put(`/api/bookings/${bookingId}/${action}`);
      fetchBookingData();
      setShowModal(false);
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.pnrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.bookingStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 via-indigo-600 to-purple-700 opacity-70 animate-gradient-y"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold drop-shadow-lg">Loading booking management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 animate-gradient-x"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 via-indigo-600 to-purple-700 opacity-70 animate-gradient-y"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/15 rounded-full animate-bounce delay-200"></div>
      <div className="absolute top-60 right-32 w-24 h-24 bg-cyan-300/25 rounded-full animate-pulse delay-400"></div>
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-purple-300/20 rounded-full animate-bounce delay-600"></div>
      
      <div className="relative z-10 min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Booking Management
                </h1>
                <p className="text-gray-600 mt-2">Professional bus booking administration</p>
              </div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl mb-8 border border-white/20">
            <div className="flex space-x-1 p-2">
              {[
                { id: 'live-bookings', name: 'Live Bookings', icon: '🎫' },
                { id: 'analytics', name: 'Analytics', icon: '📊' },
                { id: 'routes', name: 'Route Management', icon: '🗺️' },
                { id: 'fleet', name: 'Fleet Status', icon: '🚌' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Live Bookings Tab */}
          {activeTab === 'live-bookings' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by PNR or passenger name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Bookings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">PNR: {booking.pnrNumber}</h3>
                        <p className="text-gray-600">{booking.passengerName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Route:</span>
                        <span className="font-semibold">{booking.schedule?.route?.source} → {booking.schedule?.route?.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Seats:</span>
                        <span className="font-semibold">{booking.seatNumbers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-bold text-indigo-600">₹{booking.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-semibold">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold">Total Bookings</h3>
                  <p className="text-3xl font-bold mt-2">{bookings.length}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold">Confirmed</h3>
                  <p className="text-3xl font-bold mt-2">{bookings.filter(b => b.bookingStatus === 'CONFIRMED').length}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold">Pending</h3>
                  <p className="text-3xl font-bold mt-2">{bookings.filter(b => b.bookingStatus === 'PENDING').length}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold">Revenue</h3>
                  <p className="text-3xl font-bold mt-2">₹{bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Route Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => (
                  <div key={route.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <h3 className="font-bold text-lg">{route.source} → {route.destination}</h3>
                    <p className="text-gray-600 mt-2">Distance: {route.distance} km</p>
                    <p className="text-gray-600">Duration: {route.duration} hours</p>
                    <p className="text-indigo-600 font-bold mt-2">₹{route.basePrice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fleet Tab */}
          {activeTab === 'fleet' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Fleet Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <h3 className="font-bold text-lg">{vehicle.vehicleNumber}</h3>
                    <p className="text-gray-600">{vehicle.vehicleType}</p>
                    <p className="text-gray-600">Capacity: {vehicle.capacity} seats</p>
                    <p className="text-gray-600">Operator: {vehicle.operator}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">PNR Number</label>
                    <p className="text-lg font-bold">{selectedBooking.pnrNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedBooking.bookingStatus)}`}>
                      {selectedBooking.bookingStatus}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => handleBookingAction(selectedBooking.id, 'confirm')}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleBookingAction(selectedBooking.id, 'cancel')}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;