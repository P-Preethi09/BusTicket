import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, bus, passengers, contactDetails, paymentDetails } = location.state || {};

  const downloadTicketPDF = async () => {
    const ticketElement = document.getElementById('ticket-content');
    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ticket-${booking.pnrNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No booking information found</p>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div id="ticket-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-500 text-white p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-green-100">Your bus ticket has been successfully booked</p>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">PNR: {booking.pnrNumber}</h2>
              <p className="text-gray-600">Please save this PNR for future reference</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-semibold">{booking.route?.source || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-semibold">{booking.route?.destination || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Travel Date</p>
                  <p className="font-semibold">{new Date(booking.travelDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Departure Time</p>
                  <p className="font-semibold">{bus?.departureTime}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Bus Details</p>
                <p className="font-semibold">{bus?.operatorName}</p>
                <p className="text-gray-600">{bus?.vehicleType} • {bus?.vehicleNumber}</p>
              </div>

              {/* Passenger Details */}
              {passengers && passengers.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-3">Passenger Details</p>
                  <div className="space-y-2">
                    {passengers.map((passenger, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{passenger.name}</p>
                            <p className="text-sm text-gray-600">{passenger.age} years, {passenger.gender}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            Seat {passenger.seatNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Details */}
              {contactDetails && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Contact Information</p>
                  <p className="font-medium">{contactDetails.phone}</p>
                  <p className="text-gray-600">{contactDetails.email}</p>
                </div>
              )}

              {/* Payment Breakdown */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-3">Payment Details</p>
                {paymentDetails ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Amount:</span>
                      <span>₹{paymentDetails.baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee:</span>
                      <span>₹{paymentDetails.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{paymentDetails.taxAmount.toFixed(2)}</span>
                    </div>
                    {paymentDetails.appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({paymentDetails.appliedCoupon.code}):</span>
                        <span>-₹{paymentDetails.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total Paid:</span>
                      <span className="text-green-600">₹{paymentDetails.finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">₹{booking.totalAmount}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Booking Status</p>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {booking.bookingStatus || 'Confirmed'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={downloadTicketPDF}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Ticket (PDF)
              </button>
              <button
                onClick={() => navigate('/user/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Book Another Ticket
              </button>
            </div>

            {/* Important Notes */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Please arrive at the boarding point 15 minutes before departure</li>
                <li>• Carry a valid ID proof during travel</li>
                <li>• Keep your PNR number safe for future reference</li>
                <li>• Cancellation charges may apply as per operator policy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;