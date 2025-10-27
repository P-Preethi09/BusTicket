import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setBookings([]);
      setLoading(false);
      return;
    }

    api.get('/api/bookings/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(r => {
        console.log('Bookings response:', r.data);
        const data = r.data;
        
        // Ensure we always set an array
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data && data.content && Array.isArray(data.content)) {
          setBookings(data.content);
        } else {
          console.warn('Unexpected data format:', data);
          setBookings([]);
        }
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setError(err.message);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const initiatePayment = async (booking) => {
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please login to pay'); return; }

    try {
      const response = await api.post('/api/payments/initiate', {
        bookingId: booking.id,
        amount: booking.totalAmount || 0
      });

      const data = response?.data || {};
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      } else {
        alert('Payment initiated. Status: ' + (data.status || 'pending'));
      }
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Payment initiation failed: ' + (err.response?.data || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your bus ticket bookings</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading bookings...</span>
          </div>
        ) : !Array.isArray(bookings) || bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">You haven't made any bus bookings yet</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Book Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(bookings) && bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        PNR: {booking.pnrNumber}
                      </h3>
                      <p className="text-gray-600">
                        {booking.schedule?.route?.source || 'N/A'} → {booking.schedule?.route?.destination || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        (booking.bookingStatus || booking.status) === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : (booking.bookingStatus || booking.status) === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.bookingStatus || booking.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Travel Date</p>
                      <p className="font-medium">
                        {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seats</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.seatNumbers?.split(',').map(seat => (
                          <span key={seat} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                            {seat.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-green-600">₹{booking.totalAmount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Booked on: {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex space-x-2">
                      {(booking.bookingStatus || booking.status) !== 'COMPLETED' && (
                        <button
                          onClick={() => initiatePayment(booking)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Complete Payment
                        </button>
                      )}
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
