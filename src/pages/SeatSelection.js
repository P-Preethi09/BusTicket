import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData } = location.state || {};
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats] = useState([]);

  // Generate seat layout (2x2 configuration)
  const generateSeats = () => {
    const seats = [];
    const totalSeats = bus?.totalSeats || 40;
    
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        number: i,
        isBooked: bookedSeats.includes(i),
        isSelected: selectedSeats.includes(i),
        type: i <= 4 ? 'premium' : 'regular'
      });
    }
    return seats;
  };

  const seats = generateSeats();

  const toggleSeat = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return;
    
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length < (searchData.passengers || 1)) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        alert(`You can only select ${searchData.passengers || 1} seat(s)`);
      }
    }
  };

  const proceedToPayment = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to continue');
      navigate('/login');
      return;
    }

    navigate('/passenger-details', {
      state: {
        bus,
        searchData,
        selectedSeats
      }
    });
  };

  const getSeatClass = (seat) => {
    let baseClass = 'w-8 h-8 m-1 rounded cursor-pointer border-2 flex items-center justify-center text-xs font-medium transition-all ';
    
    if (seat.isBooked) {
      return baseClass + 'bg-gray-400 border-gray-400 text-white cursor-not-allowed';
    } else if (seat.isSelected) {
      return baseClass + 'bg-green-500 border-green-500 text-white';
    } else if (seat.type === 'premium') {
      return baseClass + 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
    } else {
      return baseClass + 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200';
    }
  };

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No bus selected</p>
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
                ← Back to Bus List
              </button>
              <h1 className="text-xl font-semibold">{bus.operatorName}</h1>
              <p className="text-gray-600">{searchData.from} → {searchData.to}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Departure</p>
              <p className="font-semibold">{bus.departureTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Layout */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Select Your Seats</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>

              {/* Bus Layout */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="inline-block bg-gray-300 px-4 py-2 rounded text-sm font-medium">
                    Driver
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                  {seats.map((seat, index) => {
                    // Create aisle after every 2 seats
                    const isAisle = (index + 1) % 2 === 0 && (index + 1) % 4 !== 0;
                    
                    return (
                      <React.Fragment key={seat.number}>
                        <div
                          className={getSeatClass(seat)}
                          onClick={() => toggleSeat(seat.number)}
                        >
                          {seat.number}
                        </div>
                        {isAisle && <div className="w-4"></div>}
                        {(index + 1) % 4 === 0 && <div className="col-span-5 h-2"></div>}
                      </React.Fragment>
                    );
                  })}
                </div>
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
                  <span className="font-medium">{bus.vehicleType}</span>
                </div>
              </div>

              {selectedSeats.length > 0 && (
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
              )}

              <button
                onClick={proceedToPayment}
                disabled={selectedSeats.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-md font-medium transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;