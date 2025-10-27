import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData, selectedSeats, passengers, contactDetails, totalAmount } = location.state || {};
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Tax and fee calculations
  const baseAmount = totalAmount || 0;
  const taxRate = 0.05; // 5% tax
  const serviceFee = 25; // Fixed service fee
  const taxAmount = baseAmount * taxRate;
  const discountAmount = appliedCoupon ? (baseAmount * appliedCoupon.discountPercent / 100) : 0;
  const finalAmount = baseAmount + taxAmount + serviceFee - discountAmount;

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      // Mock coupon validation - replace with actual API call
      const mockCoupons = {
        'SAVE10': { code: 'SAVE10', discountPercent: 10, description: '10% off on booking' },
        'FIRST20': { code: 'FIRST20', discountPercent: 20, description: '20% off for first booking' },
        'STUDENT15': { code: 'STUDENT15', discountPercent: 15, description: '15% student discount' }
      };

      if (mockCoupons[couponCode.toUpperCase()]) {
        setAppliedCoupon(mockCoupons[couponCode.toUpperCase()]);
        alert('Coupon applied successfully!');
      } else {
        alert('Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      alert('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const processPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to complete booking');
      navigate('/login');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        alert('Please fill all card details');
        return;
      }
    }

    setPaymentLoading(true);
    try {
      const bookingData = {
        scheduleId: bus.scheduleId,
        seatNumbers: selectedSeats.join(','),
        totalAmount: finalAmount,
        travelDate: searchData.departureDate,
        busInfo: {
          operatorName: bus.operatorName,
          vehicleType: bus.vehicleType,
          vehicleNumber: bus.vehicleNumber,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime,
          source: searchData.from,
          destination: searchData.to
        },
        passengerDetails: {
          passengers: passengers,
          contactDetails: contactDetails
        },
        paymentDetails: {
          paymentMethod: paymentMethod,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discountAmount,
          taxAmount: taxAmount,
          serviceFee: serviceFee,
          baseAmount: baseAmount
        }
      };

      const response = await api.post('/api/bookings/simple', bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      navigate('/booking-confirmation', { 
        state: { 
          booking: response.data, 
          bus, 
          passengers,
          contactDetails,
          paymentDetails: {
            baseAmount,
            taxAmount,
            serviceFee,
            discountAmount,
            finalAmount,
            appliedCoupon
          }
        } 
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!bus || !selectedSeats || !passengers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid payment data</p>
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
                ← Back to Passenger Details
              </button>
              <h1 className="text-xl font-semibold">Payment</h1>
              <p className="text-gray-600">{searchData.from} → {searchData.to}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coupon Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Apply Coupon</h2>
              
              {!appliedCoupon ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                      <p className="text-sm text-green-600">Discount: ₹{discountAmount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Available coupons: SAVE10 (10% off), FIRST20 (20% off), STUDENT15 (15% off)</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <label htmlFor="card" className="font-medium">Credit/Debit Card</label>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="ml-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardholderName}
                          onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter cardholder name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="123"
                          maxLength="4"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="upi"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <label htmlFor="upi" className="font-medium">UPI</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="netbanking"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <label htmlFor="netbanking" className="font-medium">Net Banking</label>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              
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
                  <span className="text-gray-600">Seats:</span>
                  <span className="font-medium">{selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium">{passengers.length}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <h4 className="font-medium mb-3">Price Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>₹{baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee:</span>
                    <span>₹{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={paymentLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-md font-medium transition-colors"
              >
                {paymentLoading ? 'Processing Payment...' : `Pay ₹${finalAmount.toFixed(2)}`}
              </button>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Your payment is secured with 256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;