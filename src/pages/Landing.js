import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext';
import api from '../api/axios';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
    tripType: "one-way"
  });

  const [citySuggestions, setCitySuggestions] = useState({
    from: [],
    to: []
  });

  const [showDropdown, setShowDropdown] = useState({
    from: false,
    to: false
  });

  const [loading, setLoading] = useState({
    from: false,
    to: false,
    search: false
  });

  const [routes, setRoutes] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [showBuses, setShowBuses] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([{ name: "", age: "", gender: "" }]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Create separate refs instead of an object
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const featuresRef = useRef(null);
  const routesRef = useRef(null);
  const businessRef = useRef(null);

  // Load routes on component mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await api.get('/api/routes');
        setRoutes(response.data.content || response.data);
      } catch (error) {
        console.error('Error loading routes:', error);
      }
    };
    loadRoutes();
    setIsVisible(true);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observers = [];
    
    const createObserver = (ref, className) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(className);
          }
        },
        { threshold: 0.1 }
      );
      
      if (ref.current) {
        observer.observe(ref.current);
        observers.push(observer);
      }
    };

    createObserver(servicesRef, 'animate-slide-up');
    createObserver(featuresRef, 'animate-slide-up');
    createObserver(routesRef, 'animate-slide-up');
    createObserver(businessRef, 'animate-slide-up');

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  // Fixed useEffect with proper dependencies
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowDropdown(prev => ({ ...prev, from: false }));
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowDropdown(prev => ({ ...prev, to: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fromRef, toRef]);

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/api/routes');
      const routes = response.data.content || response.data;
      const cities = new Set();
      routes.forEach(route => {
        cities.add(route.source);
        cities.add(route.destination);
      });
      return Array.from(cities).map((city, index) => ({ id: index, name: city }));
    } catch (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
  };

  const fetchCities = async (query, type) => {
    if (!query || query.length < 2) {
      setCitySuggestions(prev => ({ ...prev, [type]: [] }));
      setLoading(prev => ({ ...prev, [type]: false }));
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const allCities = await fetchRoutes();
      const filteredCities = allCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      setCitySuggestions(prev => ({ ...prev, [type]: filteredCities }));
      setShowDropdown(prev => ({ ...prev, [type]: filteredCities.length > 0 }));
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCitySuggestions(prev => ({ ...prev, [type]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Debounced version of fetchCities
  const debouncedFetchCities = debounce(fetchCities, 300);

  const handleCityInputChange = (value, type) => {
    setSearchData(prev => ({ ...prev, [type]: value }));
    
    if (value.length >= 2) {
      debouncedFetchCities(value, type);
    } else {
      setCitySuggestions(prev => ({ ...prev, [type]: [] }));
      setShowDropdown(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleCitySelect = (city, type) => {
    setSearchData(prev => ({ ...prev, [type]: city.name }));
    setShowDropdown(prev => ({ ...prev, [type]: false }));
    setCitySuggestions(prev => ({ ...prev, [type]: [] }));
  };

  const handleInputFocus = (type) => {
    if (searchData[type] && searchData[type].length >= 2) {
      setShowDropdown(prev => ({ ...prev, [type]: citySuggestions[type].length > 0 }));
    }
  };

  // Swap from and to cities
  const swapCities = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  // Mock bus data generation
  const generateMockBuses = () => {
    const busTypes = [
      { name: "AC Sleeper", amenities: ["AC", "Charging Port", "WiFi", "Blanket", "Water Bottle"] },
      { name: "Non-AC Seater", amenities: ["Charging Port", "Water Bottle"] },
      { name: "Volvo Multi-Axle", amenities: ["AC", "WiFi", "Charging Port", "Blanket", "Snacks", "Entertainment"] },
      { name: "Luxury Coach", amenities: ["AC", "WiFi", "Charging Port", "Blanket", "Meal", "Hot/Cold Water"] }
    ];
    
    const operators = [
      { name: "BoardEasy Express", rating: 4.5 },
      { name: "GreenLine Travels", rating: 4.2 },
      { name: "Comfort Coach", rating: 4.7 },
      { name: "Royal Rides", rating: 4.8 },
      { name: "Swift Travels", rating: 4.3 },
      { name: "Premium Line", rating: 4.6 }
    ];
    
    const departureTimes = ["06:00", "08:30", "11:00", "14:15", "18:45", "22:00", "23:30"];
    const arrivalTimes = ["12:30", "15:00", "17:30", "20:45", "01:15", "04:30", "06:00"];
    
    return Array.from({ length: 12 }, (_, index) => {
      const busType = busTypes[index % busTypes.length];
      const operator = operators[index % operators.length];
      const basePrice = 500 + (index % 4) * 200;
      const dynamicPrice = basePrice + Math.floor(Math.random() * 300);
      
      return {
        id: index + 1,
        operator: operator.name,
        type: busType.name,
        departure: departureTimes[index % departureTimes.length],
        arrival: arrivalTimes[index % arrivalTimes.length],
        duration: "7h 30m",
        price: dynamicPrice,
        seats: Math.max(5, 40 - index * 3),
        rating: operator.rating,
        amenities: busType.amenities,
        cancellation: index % 2 === 0 ? "Free cancellation" : "Moderate cancellation",
        features: ["Live Tracking", "Punctuality", "Cleanliness"][index % 3]
      };
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      alert('Please login to search and book tickets');
      navigate('/login');
      return;
    }
    
    // Validate required fields
    const errors = [];
    if (!searchData.from.trim()) errors.push('Departure city is required');
    if (!searchData.to.trim()) errors.push('Destination city is required');
    if (!searchData.departureDate) errors.push('Travel date is required');
    if (searchData.tripType === "round-trip" && !searchData.returnDate) {
      errors.push('Return date is required for round trip');
    }
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    // Navigate to bus search page with search parameters
    navigate('/bus-search', { state: searchData });
  };

  const handleBusSelect = (bus) => {
    if (!isAuthenticated()) {
      alert('Please login to book tickets');
      navigate('/login');
      return;
    }
    
    setSelectedBus(bus);
    setBookingStep(2);
    setPassengerDetails(Array.from({ length: searchData.passengers }, () => ({ 
      name: "", 
      age: "", 
      gender: "",
      email: "",
      phone: ""
    })));
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengerDetails];
    updatedPassengers[index][field] = value;
    setPassengerDetails(updatedPassengers);
  };

  const addPassenger = () => {
    if (passengerDetails.length < 6) {
      setPassengerDetails([...passengerDetails, { name: "", age: "", gender: "", email: "", phone: "" }]);
      setSearchData(prev => ({ ...prev, passengers: prev.passengers + 1 }));
    }
  };

  const removePassenger = (index) => {
    if (passengerDetails.length > 1) {
      const updatedPassengers = passengerDetails.filter((_, i) => i !== index);
      setPassengerDetails(updatedPassengers);
      setSearchData(prev => ({ ...prev, passengers: prev.passengers - 1 }));
    }
  };

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
      if (selectedSeats.length < searchData.passengers) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        alert(`You can only select ${searchData.passengers} seat(s) for ${searchData.passengers} passenger(s)`);
      }
    }
  };

  const handleBooking = () => {
    // Validate passenger details
    for (let i = 0; i < passengerDetails.length; i++) {
      const passenger = passengerDetails[i];
      if (!passenger.name.trim() || !passenger.age || !passenger.gender) {
        alert(`Please fill all details for Passenger ${i + 1}`);
        return;
      }
      if (passenger.age < 5 || passenger.age > 100) {
        alert(`Please enter a valid age for Passenger ${i + 1}`);
        return;
      }
    }

    if (selectedSeats.length !== searchData.passengers) {
      alert(`Please select ${searchData.passengers} seat(s) for ${searchData.passengers} passenger(s)`);
      return;
    }

    const bookingData = {
      bookingId: `BE${Date.now()}`,
      userId: user?.id,
      username: user?.username,
      bus: selectedBus,
      passengers: passengerDetails,
      seats: selectedSeats.sort((a, b) => a - b),
      journey: searchData,
      totalAmount: selectedBus.price * searchData.passengers,
      bookingDate: new Date().toLocaleDateString(),
      bookingTime: new Date().toLocaleTimeString()
    };

    setBookingSummary(bookingData);
    setBookingStep(4);
  };

  const confirmBooking = async () => {
    try {
      const bookingPayload = {
        seatNumbers: selectedSeats,
        totalAmount: selectedBus.price * searchData.passengers + Math.floor(selectedBus.price * searchData.passengers * 0.18) + 30,
        travelDate: searchData.departureDate,
        busInfo: {
          operator: selectedBus.operator,
          type: selectedBus.type,
          departure: selectedBus.departure,
          arrival: selectedBus.arrival
        },
        passengerDetails: passengerDetails
      };

      const response = await api.post('/api/bookings/simple', bookingPayload);
      
      alert(`Booking confirmed! Your booking ID is ${response.data.pnrNumber}. An email has been sent with your ticket details.`);
      
      // Reset booking process
      setBookingStep(1);
      setSelectedBus(null);
      setSelectedSeats([]);
      setBookingSummary(null);
      setShowBuses(false);
    } catch (error) {
      alert('Booking failed. Please try again.');
      console.error('Booking error:', error);
    }
  };

  const goBackToBuses = () => {
    setBookingStep(1);
    setSelectedBus(null);
  };

  const goBackToPassengers = () => {
    setBookingStep(2);
  };

  const goBackToSeats = () => {
    setBookingStep(3);
  };





  const systemFeatures = [
    {
      title: "Instant Booking",
      description: "Secure your seat in seconds with our streamlined booking process",
      icon: "⚡"
    },
    {
      title: "Live Tracking",
      description: "Real-time bus location and estimated arrival times",
      icon: "📍"
    },
    {
      title: "Secure Payments",
      description: "Multiple payment options with bank-level security",
      icon: "🔒"
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock customer service for all your travel needs",
      icon: "📞"
    },
    {
      title: "Easy Cancellation",
      description: "Hassle-free cancellation and refund process within minutes",
      icon: "🔄"
    },
    {
      title: "Best Price Guarantee",
      description: "Competitive pricing with exclusive deals and discounts",
      icon: "💰"
    },
    {
      title: "Mobile Tickets",
      description: "Digital tickets on your phone - no printing required",
      icon: "📱"
    },
    {
      title: "Seat Selection",
      description: "Choose your preferred seat with our interactive seat map",
      icon: "🪑"
    }
  ];

  // Bus Card Component
  const BusCard = ({ bus }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-brand-primary transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors duration-300">{bus.operator}</h3>
          <p className="text-white/70 text-sm">{bus.type}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-brand-primary group-hover:scale-110 transition-transform duration-300">₹{bus.price}</div>
          <div className="text-white/70 text-sm">per seat</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-white font-semibold">{bus.departure}</div>
          <div className="text-white/70 text-sm">Departure</div>
        </div>
        <div>
          <div className="text-white font-semibold">{bus.arrival}</div>
          <div className="text-white/70 text-sm">Arrival</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-white/70">{bus.duration}</div>
        <div className="flex items-center">
          <span className="text-yellow-400">⭐</span>
          <span className="text-white ml-1">{bus.rating}</span>
          <span className="text-white/70 text-sm ml-2">({Math.floor(bus.rating * 45)} reviews)</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-white/70">
          <span className={`${bus.seats < 10 ? 'text-red-400' : 'text-green-400'}`}>
            {bus.seats} seats left
          </span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {bus.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="bg-white/20 text-white/90 px-2 py-1 rounded text-xs">
              {amenity}
            </span>
          ))}
          {bus.amenities.length > 3 && (
            <span className="bg-white/20 text-white/90 px-2 py-1 rounded text-xs">
              +{bus.amenities.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-green-400 text-sm">{bus.cancellation}</span>
        <span className="text-blue-400 text-sm">{bus.features}</span>
      </div>
      
      <button
        onClick={() => handleBusSelect(bus)}
        className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-primary/80 transition-all duration-300 transform hover:scale-105 group-hover:shadow-lg"
      >
        Select Seats
      </button>
    </div>
  );

  // Seat Layout Component
  const SeatLayout = () => {
    const seats = Array.from({ length: 40 }, (_, i) => i + 1);
    const bookedSeats = [5, 12, 18, 23, 29, 34]; // Mock booked seats
    
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Select Your Seats</h3>
          <div className="text-white/70">
            Selected: <span className="text-brand-primary font-bold">{selectedSeats.length}</span> of {searchData.passengers}
          </div>
        </div>

        {/* Seat Legend */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-white">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-brand-primary rounded"></div>
            <span className="text-white">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-white">Booked</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {seats.map(seat => {
            const isBooked = bookedSeats.includes(seat);
            const isSelected = selectedSeats.includes(seat);
            
            return (
              <button
                key={seat}
                onClick={() => !isBooked && handleSeatSelect(seat)}
                disabled={isBooked}
                className={`p-3 rounded-lg font-semibold transition-all duration-300 ${
                  isBooked
                    ? 'bg-red-500/50 text-white/50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-brand-primary text-white transform scale-110'
                    : 'bg-green-500/20 text-white hover:bg-green-500/40 hover:scale-105'
                }`}
              >
                {seat}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={goBackToPassengers}
            className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
          >
            ← Back
          </button>
          <button
            onClick={() => setBookingStep(4)}
            disabled={selectedSeats.length !== searchData.passengers}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary/80 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    );
  };

  // Passenger Details Component
  const PassengerDetails = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Passenger Details</h3>
        <button
          onClick={addPassenger}
          disabled={passengerDetails.length >= 6}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Passenger
        </button>
      </div>

      <div className="space-y-6">
        {passengerDetails.map((passenger, index) => (
          <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">Passenger {index + 1}</h4>
              {passengerDetails.length > 1 && (
                <button
                  onClick={() => removePassenger(index)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={passenger.name}
                onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                className="border-2 border-white/20 rounded-xl p-3 text-white bg-white/10 backdrop-blur-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Age *"
                value={passenger.age}
                onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                min="5"
                max="100"
                className="border-2 border-white/20 rounded-xl p-3 text-white bg-white/10 backdrop-blur-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
              />
              <select
                value={passenger.gender}
                onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                className="border-2 border-white/20 rounded-xl p-3 text-white bg-white/10 backdrop-blur-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
              >
                <option value="">Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                type="email"
                placeholder="Email"
                value={passenger.email}
                onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                className="border-2 border-white/20 rounded-xl p-3 text-white bg-white/10 backdrop-blur-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={passenger.phone}
                onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                className="border-2 border-white/20 rounded-xl p-3 text-white bg-white/10 backdrop-blur-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={goBackToBuses}
          className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
        >
          ← Back to Buses
        </button>
        <button
          onClick={() => setBookingStep(3)}
          className="bg-brand-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary/80 transition-all duration-300 transform hover:scale-105"
        >
          Continue to Seat Selection
        </button>
      </div>
    </div>
  );

  // Booking Summary Component
  const BookingSummary = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h3 className="text-2xl font-bold text-white mb-6">Booking Summary</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Journey Details */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-brand-primary mb-4">Journey Details</h4>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-semibold">{searchData.from} → {searchData.to}</span>
              <span className="text-brand-primary font-bold">₹{selectedBus.price * searchData.passengers}</span>
            </div>
            <div className="text-white/70 space-y-1">
              <div>Date: {new Date(searchData.departureDate).toLocaleDateString()}</div>
              <div>Time: {selectedBus.departure} - {selectedBus.arrival}</div>
              <div>Duration: {selectedBus.duration}</div>
              <div>Bus: {selectedBus.operator} - {selectedBus.type}</div>
              <div>Seats: {selectedSeats.join(', ')}</div>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-brand-primary mb-4">Passenger Details</h4>
          <div className="space-y-3">
            {passengerDetails.map((passenger, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-3">
                <div className="text-white font-semibold">Passenger {index + 1}</div>
                <div className="text-white/70 text-sm">
                  {passenger.name} • {passenger.age} years • {passenger.gender}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="mt-6 bg-white/5 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-brand-primary mb-3">Price Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-white">
            <span>Base Fare ({searchData.passengers} x ₹{selectedBus.price})</span>
            <span>₹{selectedBus.price * searchData.passengers}</span>
          </div>
          <div className="flex justify-between text-white">
            <span>Taxes & Fees</span>
            <span>₹{Math.floor(selectedBus.price * searchData.passengers * 0.18)}</span>
          </div>
          <div className="flex justify-between text-white">
            <span>Service Charge</span>
            <span>₹30</span>
          </div>
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="flex justify-between text-xl font-bold text-brand-primary">
              <span>Total Amount</span>
              <span>₹{selectedBus.price * searchData.passengers + Math.floor(selectedBus.price * searchData.passengers * 0.18) + 30}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={goBackToSeats}
          className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
        >
          ← Back to Seats
        </button>
        <button
          onClick={confirmBooking}
          className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Confirm & Pay
        </button>
      </div>
    </div>
  );





  const CityDropdown = ({ suggestions, type, onSelect, inputRef, isLoading }) => (
    <div 
      ref={inputRef}
      className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto animate-fade-in"
    >
      {isLoading ? (
        <div className="px-4 py-3 text-center text-gray-600">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary mr-2"></div>
          Searching cities...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-4 py-3 text-center text-gray-600">
          No cities found
        </div>
      ) : (
        suggestions.map((city, index) => (
          <div
            key={city.id}
            className="px-4 py-3 hover:bg-brand-primary hover:text-white cursor-pointer transition-all duration-300 border-b border-white/20 last:border-b-0 transform hover:translate-x-2"
            onClick={() => onSelect(city, type)}
          >
            <div className="font-medium">{city.name}</div>
          </div>
        ))
      )}
    </div>
  );

  // Floating particles for background
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            width: Math.random() * 20 + 10,
            height: Math.random() * 20 + 10,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
            animationDelay: Math.random() * 5 + 's',
          }}
        />
      ))}
    </div>
  );

  // Booking Steps Progress
  const BookingProgress = () => (
    <div className="flex justify-center mb-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="flex items-center space-x-8">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                bookingStep >= step 
                  ? 'bg-brand-primary text-white scale-110' 
                  : 'bg-white/20 text-white/70'
              }`}>
                {step}
              </div>
              <div className={`ml-3 font-semibold ${
                bookingStep >= step ? 'text-white' : 'text-white/50'
              }`}>
                {step === 1 && 'Select Bus'}
                {step === 2 && 'Passenger Details'}
                {step === 3 && 'Select Seats'}
                {step === 4 && 'Confirm Booking'}
              </div>
              {step < 4 && (
                <div className={`w-12 h-1 mx-4 ${
                  bookingStep > step ? 'bg-brand-primary' : 'bg-white/20'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced GIF Background with Overlay */}
      <div className="fixed inset-0 w-full h-full z-0" style={{
        backgroundImage: `url('/bus-gif.gif')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}></div>
      
      {/* Enhanced overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#19183B]/80 via-[#19183B]/60 to-[#19183B]/90 z-0"></div>
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-2xl font-black text-white hover:text-brand-primary transition-colors duration-300">
                <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
                BoardEasy
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-brand-primary transition-colors duration-300 font-semibold">
                Home
              </Link>
              <button 
                onClick={() => {
                  const section = document.getElementById('offers');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-white hover:text-brand-primary transition-colors duration-300 font-semibold"
              >
                Offers
              </button>
              <button 
                onClick={() => {
                  const section = document.getElementById('features');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-white hover:text-brand-primary transition-colors duration-300 font-semibold"
              >
                Features
              </button>
              <Link to="/routes" className="text-white hover:text-brand-primary transition-colors duration-300 font-semibold">
                Routes
              </Link>
              
              {!isAuthenticated() ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/register" 
                    className="bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login" 
                    className="text-white hover:text-brand-primary transition-colors duration-300 font-semibold"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'DRIVER' ? '/driver/dashboard' : '/user/dashboard');
                  }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 hover:bg-white/20 transition-all duration-300"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    user?.role === 'ADMIN' ? 'bg-red-600' : 
                    user?.role === 'DRIVER' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-semibold">{user?.username}</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-white hover:text-brand-primary transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center relative"
        >
          <div className={`max-w-6xl mx-auto w-full relative z-10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="text-center mb-12 animate-float">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                Welcome to
                <span className="block text-brand-primary drop-shadow-2xl animate-pulse-slow">BoardEasy</span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                Your seamless journey begins here. Book bus tickets with ease and confidence across India's largest network
              </p>
            </div>

            {/* Enhanced Quick Booking Card */}
            <div id="search-form" className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-white/20 hover:border-brand-primary/50 transition-all duration-500 transform hover:scale-[1.02]">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">Find Your Perfect Ride</h2>
                <p className="text-white/80">Search across 5000+ routes and 200+ trusted operators</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                {/* Trip Type Selection */}
                <div className="flex space-x-4 mb-6">
                  {["one-way", "round-trip"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSearchData(prev => ({ ...prev, tripType: type }))}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        searchData.tripType === type
                          ? 'bg-brand-primary text-white shadow-lg'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {type === "one-way" ? "One Way" : "Round Trip"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Departure City with Dropdown */}
                  <div className="relative" ref={fromRef}>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Source
                    </label>
                    <input
                      type="text"
                      placeholder="Enter departure city"
                      className="w-full border-2 border-white/20 rounded-xl p-4 text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 bg-white/10 backdrop-blur-sm"
                      value={searchData.from}
                      onChange={(e) => handleCityInputChange(e.target.value, 'from')}
                      onFocus={() => handleInputFocus('from')}
                      autoComplete="off"
                    />
                    {showDropdown.from && (
                      <CityDropdown
                        suggestions={citySuggestions.from}
                        type="from"
                        onSelect={handleCitySelect}
                        inputRef={fromRef}
                        isLoading={loading.from}
                      />
                    )}
                  </div>
                  
                  {/* Swap Button */}
                  <div className="flex items-end justify-center">
                    <button
                      type="button"
                      onClick={swapCities}
                      className="bg-white/20 text-white p-3 rounded-xl hover:bg-brand-primary transition-all duration-300 transform hover:scale-110 hover:rotate-180"
                      title="Swap cities"
                    >
                      ⇄
                    </button>
                  </div>
                  
                  {/* Destination City with Dropdown */}
                  <div className="relative" ref={toRef}>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Destination
                    </label>
                    <input
                      type="text"
                      placeholder="Enter destination city"
                      className="w-full border-2 border-white/20 rounded-xl p-4 text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 bg-white/10 backdrop-blur-sm"
                      value={searchData.to}
                      onChange={(e) => handleCityInputChange(e.target.value, 'to')}
                      onFocus={() => handleInputFocus('to')}
                      autoComplete="off"
                    />
                    {showDropdown.to && (
                      <CityDropdown
                        suggestions={citySuggestions.to}
                        type="to"
                        onSelect={handleCitySelect}
                        inputRef={toRef}
                        isLoading={loading.to}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      className="w-full border-2 border-white/20 rounded-xl p-4 text-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 bg-white/10 backdrop-blur-sm"
                      value={searchData.departureDate}
                      onChange={(e) => setSearchData({...searchData, departureDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  {searchData.tripType === "round-trip" && (
                    <div>
                      <label className="block text-sm font-semibold text-white mb-3">
                        Return Date
                      </label>
                      <input
                        type="date"
                        className="w-full border-2 border-white/20 rounded-xl p-4 text-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 bg-white/10 backdrop-blur-sm"
                        value={searchData.returnDate}
                        onChange={(e) => setSearchData({...searchData, returnDate: e.target.value})}
                        min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Passengers
                    </label>
                    <select
                      className="w-full border-2 border-white/20 rounded-xl p-4 text-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 bg-white/10 backdrop-blur-sm"
                      value={searchData.passengers}
                      onChange={(e) => setSearchData({...searchData, passengers: parseInt(e.target.value)})}
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num} className="text-gray-800">
                          {num} Passenger{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading.search}
                    className="w-full md:w-auto btn-primary text-lg font-bold py-4 px-12 rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-2xl backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.search ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Searching Buses...
                      </div>
                    ) : (
                      "Search Buses"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-white/80">
                  Need travel assistance? <Link to="/support" className="text-brand-primary font-semibold hover:text-white transition-colors duration-300">Contact BoardEasy Support</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Offers Section */}
        <section id="offers" className="py-20 bg-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
                <svg className="w-10 h-10 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Special Offers
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Save more on your bus bookings with our exclusive deals and offers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">First Ride Free</h3>
                  <p className="text-white/80 mb-4">Get 100% cashback up to ₹200 on your first booking</p>
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Code: FIRST200</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 10v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h14l4 4zM8 14c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm8 0c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Weekend Special</h3>
                  <p className="text-white/80 mb-4">Flat 25% off on weekend bookings for premium buses</p>
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Code: WEEKEND25</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Group Booking</h3>
                  <p className="text-white/80 mb-4">Book 4+ seats and get 15% discount on total fare</p>
                  <div className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">Code: GROUP15</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Buses Section */}
        {showBuses && (
          <section id="available-buses" className="py-20 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Available Buses
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  {availableBuses.length} buses found from {searchData.from} to {searchData.to} on {new Date(searchData.departureDate).toLocaleDateString()}
                </p>
              </div>

              {bookingStep === 1 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {availableBuses.map((bus, index) => (
                      <BusCard key={bus.id} bus={bus} />
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => setShowBuses(false)}
                      className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300"
                    >
                      ← Back to Search
                    </button>
                  </div>
                </>
              ) : (
                <div className="max-w-6xl mx-auto">
                  <BookingProgress />
                  
                  {bookingStep === 2 && <PassengerDetails />}
                  {bookingStep === 3 && <SeatLayout />}
                  {bookingStep === 4 && <BookingSummary />}
                </div>
              )}
            </div>
          </section>
        )}



        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-20 bg-transparent overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
                <svg className="w-10 h-10 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                </svg>
                Why Choose BoardEasy?
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Experience the difference with features designed for modern travelers
              </p>
            </div>
            
            {/* Animated Feature Cards */}
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll space-x-6" style={{ width: 'max-content' }}>
                {[...systemFeatures, ...systemFeatures, ...systemFeatures].map((feature, index) => (
                  <div 
                    key={index}
                    className="w-[300px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-brand-primary transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:rotate-1 group flex-shrink-0"
                  >
                    <div className="text-center">
                      {/* BoardEasy Logo */}
                      <div className="mb-6 transform group-hover:scale-110 transition-all duration-500">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                          </svg>
                        </div>
                        <div className="text-brand-primary font-black text-lg mt-2 group-hover:text-white transition-colors duration-300">
                          BoardEasy
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-brand-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-white/70 group-hover:text-white transition-colors duration-300 leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      
                      {/* Additional Content */}
                      <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
                        {feature.title === 'Instant Booking' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              <span>Real-time seat availability</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              <span>Instant confirmation</span>
                            </div>
                          </div>
                        )}
                        {feature.title === 'Live Tracking' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              <span>GPS-enabled tracking</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              <span>ETA notifications</span>
                            </div>
                          </div>
                        )}
                        {feature.title === 'Secure Payments' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              <span>256-bit SSL encryption</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              <span>Multiple payment options</span>
                            </div>
                          </div>
                        )}
                        {feature.title === '24/7 Support' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                              <span>Round-the-clock assistance</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                              <span>Multi-language support</span>
                            </div>
                          </div>
                        )}
                        {feature.title === 'Easy Cancellation' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                              <span>Free cancellation up to 2 hours</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                              <span>Instant refund processing</span>
                            </div>
                          </div>
                        )}
                        {feature.title === 'Best Price Guarantee' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                              <span>Lowest fare guarantee</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                              <span>Exclusive member discounts</span>
                            </div>
                          </div>
                        )}
                        {feature.title === 'Mobile Tickets' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                              <span>Paperless travel experience</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                              <span>QR code verification</span>
                            </div>
                          </div>
                        )}
                        {feature.title === 'Seat Selection' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                              <span>Interactive seat map</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                              <span>Window & aisle preferences</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations Section */}
        <section className="py-20 bg-transparent overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
                <svg className="w-10 h-10 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Popular Destinations
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Discover India's most beautiful destinations, especially Tamil Nadu's cultural treasures.
              </p>
            </div>
            
            {/* Animated Destination Cards */}
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll space-x-6" style={{ width: 'max-content' }}>
                {[
                  { name: "Meenakshi Temple", location: "Madurai, Tamil Nadu", image: "/Meenakshi Amman.jpg" },
                  { name: "Mahabalipuram", location: "Tamil Nadu", image: "/Mahabalipuram.jpg" },
                  { name: "Ooty Hill Station", location: "Tamil Nadu", image: "/ooty.jpg" },
                  { name: "Rameswaram Temple", location: "Tamil Nadu", image: "/Rameshwaram.jpg" },
                  { name: "Kanyakumari", location: "Tamil Nadu", image: "/Kanyakumari.jpg" },
                  { name: "Thanjavur Palace", location: "Tamil Nadu", image: "/thanjavur.jpg" },
                  { name: "Kodaikanal", location: "Tamil Nadu", image: "/kodaikanal.jpg" },
                  { name: "Pondicherry", location: "Tamil Nadu", image: "/pondicherry.jpg" },
                  { name: "Hampi Ruins", location: "Karnataka", image: "/karnataka.jpeg" },
                  { name: "Mysore Palace", location: "Karnataka", image: "/mysore.jpg" },
                  { name: "Goa Beaches", location: "Goa", image: "/goa.jpeg" },
                ].concat([
                  { name: "Meenakshi Temple", location: "Madurai, Tamil Nadu", image: "/Meenakshi Amman.jpg" },
                  { name: "Mahabalipuram", location: "Tamil Nadu", image: "/Mahabalipuram.jpg" },
                  { name: "Ooty Hill Station", location: "Tamil Nadu", image: "/ooty.jpg" },
                  { name: "Rameswaram Temple", location: "Tamil Nadu", image: "/Rameshwaram.jpg" },
                  { name: "Kanyakumari", location: "Tamil Nadu", image: "/Kanyakumari.jpg" },
                  { name: "Thanjavur Palace", location: "Tamil Nadu", image: "/thanjavur.jpg" },
                  { name: "Kodaikanal", location: "Tamil Nadu", image: "/kodaikanal.jpg" },
                  { name: "Pondicherry", location: "Tamil Nadu", image: "/pondicherry.jpg" },
                  { name: "Hampi Ruins", location: "Karnataka", image: "/karnataka.jpeg" },
                  { name: "Mysore Palace", location: "Karnataka", image: "/mysore.jpg" },
                  { name: "Goa Beaches", location: "Goa", image: "/goa.jpeg" },
                ]).map((destination, index) => (
                  <div 
                    key={index}
                    className="w-[350px] h-[400px] bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-brand-primary transition-all duration-500 hover:shadow-2xl transform hover:scale-105 group flex-shrink-0"
                  >
                    <div className="relative w-full h-full overflow-hidden">
                      <img 
                        src={destination.image || '/placeholder.jpg'} 
                        alt={destination.name}
                        className="w-full h-2/3 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span className="text-white/80 text-sm">{destination.location}</span>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-3">{destination.name}</h3>
                        <button className="w-full bg-gradient-to-r from-brand-primary to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-brand-primary transition-all duration-300 transform hover:scale-105">
                          Book Journey
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Routes Preview */}
        <section ref={routesRef} className="py-20 bg-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 opacity-0 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Popular BoardEasy Routes
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                Journey confidently on our most trusted and frequently booked routes
              </p>
              <Link 
                to="/routes"
                className="btn-primary px-8 py-3 font-bold rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-300"
              >
                View All Routes
              </Link>
            </div>
          </div>
        </section>

        {/* Management Features */}
        <section ref={businessRef} className="py-20 bg-transparent text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 opacity-0 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                BoardEasy for Business
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Powerful tools for bus operators and travel partners
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Operator Dashboard",
                  desc: "Manage routes, schedules, and fleet operations with BoardEasy's intuitive dashboard",
                  icon: "📊"
                },
                {
                  title: "Travel Agent Portal",
                  desc: "Streamlined booking management and commission tracking with BoardEasy",
                  icon: "👨‍💼"
                },
                {
                  title: "Fleet Management",
                  desc: "Comprehensive vehicle tracking and maintenance scheduling on BoardEasy",
                  icon: "🚌"
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 hover:border-brand-primary transition-all duration-500 transform hover:-translate-y-2 group opacity-0 animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="mb-4 flex justify-center">
                    {item.title === 'Operator Dashboard' && (
                      <svg className="w-12 h-12 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                      </svg>
                    )}
                    {item.title === 'Travel Agent Portal' && (
                      <svg className="w-12 h-12 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                    {item.title === 'Fleet Management' && (
                      <svg className="w-12 h-12 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-brand-primary transition-colors duration-300">{item.title}</h3>
                  <p className="opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-transparent backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 animate-pulse-slow">
              Ready to Travel with BoardEasy?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who trust BoardEasy for their journey across India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary px-8 py-4 font-bold rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-2xl backdrop-blur-sm border border-white/20 animate-bounce-slow"
              >
                Create Your Account
              </Link>
              <Link
                to="/partner-with-us"
                className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-xl hover:border-brand-primary hover:text-brand-primary transform hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-white/10"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </section>
      </div>

    
    </div>
  );
};

export default Landing;