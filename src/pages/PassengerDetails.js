import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData, selectedSeats } = location.state || {};
  
  const [passengers, setPassengers] = useState(
    selectedSeats?.map((seat, index) => ({
      seatNumber: seat,
      name: '',
      age: '',
      gender: 'male',
      phone: index === 0 ? '' : '', // Only first passenger needs phone
      email: index === 0 ? '' : ''  // Only first passenger needs email
    })) || []
  );

  const [contactDetails, setContactDetails] = useState({
    phone: '',
    email: ''
  });

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const validateForm = () => {
    // Validate contact details
    if (!contactDetails.phone || !contactDetails.email) {
      alert('Please provide contact phone and email');
      return false;
    }

    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      if (!passenger.name || !passenger.age || !passenger.gender) {
        alert(`Please fill all details for passenger ${i + 1}`);
        return false;
      }
      if (passenger.age < 1 || passenger.age > 120) {
        alert(`Please enter a valid age for passenger ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const proceedToPayment = () => {
    if (!validateForm()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to continue with booking');
      navigate('/login');
      return;
    }

    navigate('/payment', {
      state: {
        bus,
        searchData,
        selectedSeats,
        passengers,
        contactDetails,
        totalAmount: selectedSeats.length * parseFloat(bus.price)
      }
    });
  };

  if (!bus || !selectedSeats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid booking data</p>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">
            Go back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800 mb-2">
                ← Back to Seat Selection
              </button>
              <h1 className="text-xl font-semibold">Passenger Details</h1>
              <p className="text-gray-600">{searchData.from} → {searchData.to}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Passenger Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Enter Passenger Details</h2>
              
              {/* Contact Details */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={contactDetails.phone}
                      onChange={(e) => setContactDetails({...contactDetails, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) => setContactDetails({...contactDetails, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">
                      Passenger {index + 1} - Seat {passenger.seatNumber}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Age"
                          min="1"
                          max="120"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{searchData.from} → {searchData.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(searchData.departureDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure:</span>
                  <span className="font-medium">{bus.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus:</span>
                  <span className="font-medium">{bus.operatorName}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <h4 className="font-medium mb-2">Selected Seats</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {seat}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Seats ({selectedSeats.length}):</span>
                    <span>₹{(selectedSeats.length * parseFloat(bus.price)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{(selectedSeats.length * parseFloat(bus.price)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToPayment}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-medium transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;