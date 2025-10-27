import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [activeForm, setActiveForm] = useState('selection');
  const [userForm, setUserForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phoneNumber: '',
    fullName: ''
  });
  const [busForm, setBusForm] = useState({
    busNumber: '',
    registrationNumber: '',
    busType: '',
    capacity: '',
    amenities: [],
    operatorName: '',
    operatorLicense: '',
    model: '',
    year: '',
    fuelType: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    facilities: []
  });
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate phone number
  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  // Validate password strength
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateUserForm = (isOperator = false) => {
    const newErrors = {};
    
    if (!userForm.username.trim()) newErrors.username = 'Username is required';
    if (!userForm.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!validateEmail(userForm.email)) newErrors.email = 'Valid email is required';
    if (!validatePhone(userForm.phoneNumber)) newErrors.phoneNumber = 'Valid 10-digit phone number is required';
    if (!validatePassword(userForm.password)) newErrors.password = 'Password must be at least 6 characters';
    if (userForm.password !== userForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBusForm = () => {
    const newErrors = {};
    
    if (!busForm.busNumber.trim()) newErrors.busNumber = 'Bus number is required';
    if (!busForm.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!busForm.busType) newErrors.busType = 'Bus type is required';
    if (!busForm.capacity || busForm.capacity < 1) newErrors.capacity = 'Valid capacity is required';
    if (!busForm.operatorName.trim()) newErrors.operatorName = 'Operator name is required';
    if (!busForm.operatorLicense.trim()) newErrors.operatorLicense = 'Operator license is required';
    if (!busForm.model.trim()) newErrors.model = 'Model is required';
    if (!busForm.year || busForm.year < 2000 || busForm.year > new Date().getFullYear()) newErrors.year = 'Valid year is required';
    if (!busForm.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!busForm.insuranceNumber.trim()) newErrors.insuranceNumber = 'Insurance number is required';
    if (!busForm.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitPassenger = async (e) => {
    e.preventDefault();
    if (!validateUserForm(false)) return;
    
    try {
      const res = await api.post('/api/auth/register', {
        ...userForm,
        role: 'passenger'
      });
      setMsg('Passenger registered successfully! ID: ' + res.data.userId);
      setActiveForm('selection');
      setUserForm({ username: '', email: '', password: '', confirmPassword: '', phoneNumber: '', fullName: '' });
      setErrors({});
    } catch (err) {
      setMsg(err?.response?.data || err?.response?.data?.message || 'Passenger registration failed');
    }
  };

  const submitOperator = async (e) => {
    e.preventDefault();
    if (!validateUserForm(true)) return;
    
    try {
      const res = await api.post('/api/auth/register', {
        ...userForm,
        role: 'driver', 
        companyName: userForm.fullName
      });
      setMsg('Bus operator registered successfully! ID: ' + res.data.userId);
      setActiveForm('selection');
      setUserForm({ username: '', email: '', password: '', confirmPassword: '', phoneNumber: '', fullName: '' });
      setErrors({});
    } catch (err) {
      setMsg(err?.response?.data || err?.response?.data?.message || 'Bus operator registration failed');
    }
  };

  const submitBus = async (e) => {
    e.preventDefault();
    if (!validateBusForm()) return;
    
    try {
      // Map form data to Vehicle model structure
      const vehicleData = {
        vehicleNumber: busForm.busNumber,
        vehicleType: busForm.busType,
        capacity: parseInt(busForm.capacity),
        vehicleName: busForm.model,
        operator: busForm.operatorName
      };
      
      const res = await api.post('/api/vehicles', vehicleData);
      setMsg('Vehicle registered successfully! Vehicle ID: ' + res.data.id);
      setActiveForm('selection');
      setBusForm({
        busNumber: '',
        registrationNumber: '',
        busType: '',
        capacity: '',
        amenities: [],
        operatorName: '',
        operatorLicense: '',
        model: '',
        year: '',
        fuelType: '',
        insuranceNumber: '',
        insuranceExpiry: '',
        facilities: []
      });
      setErrors({});
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Vehicle registration failed');
    }
  };

  const handleAmenityChange = (amenity) => {
    setBusForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFacilityChange = (facility) => {
    setBusForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const busTypes = [
    'AC Sleeper',
    'Non-AC Sleeper',
    'AC Seater',
    'Non-AC Seater',
    'Volvo Multi-Axle',
    'Mercedes Benz',
    'Luxury Coach',
    'Semi Sleeper',
    'Mini Bus'
  ];

  const fuelTypes = [
    'Diesel',
    'Electric',
    'CNG',
    'Hybrid',
    'Petrol'
  ];

  const amenitiesList = [
    'WiFi',
    'Charging Ports',
    'TV',
    'Blanket',
    'Pillow',
    'Reading Light',
    'Curtains',
    'Water Bottle',
    'Snacks'
  ];

  const facilitiesList = [
    'GPS Tracking',
    'CCTV Cameras',
    'Fire Extinguisher',
    'First Aid Kit',
    'Emergency Exits',
    'Air Suspension',
    'Power Steering',
    'ABS',
    'Air Conditioning'
  ];

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: `url('/bus image.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dark overlay for content visibility */}
      <div className="absolute inset-0 bg-[#19183B]/80 z-0"></div>
      
      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="flex items-center space-x-2 px-4 py-2 bg-[#E7F2EF]/20 backdrop-blur-md text-[#E7F2EF] rounded-xl border border-[#A1C2BD]/30 hover:bg-[#E7F2EF] hover:text-[#19183B] transition-all duration-300"
        >
          <span>← Back to Home</span>
        </Link>
      </div>

      {/* Registration Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-5xl">
          {activeForm === 'selection' ? (
            <div className="text-center">
              <h1 className="text-5xl font-black text-[#E7F2EF] mb-6">Join BoardEasy</h1>
              <p className="text-xl text-[#A1C2BD] mb-16 max-w-3xl mx-auto">
                Choose your account type to start your bus booking journey
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Passenger Registration Card */}
                <div className="bg-[#E7F2EF]/10 backdrop-blur-lg rounded-3xl p-10 border-2 border-[#708993]/30 hover:border-[#A1C2BD] transition-all duration-500 hover:transform hover:scale-105 group">
                  <div className="w-20 h-20 bg-[#A1C2BD] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#19183B" strokeWidth="2"/>
                      <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="#19183B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-[#E7F2EF] mb-6 group-hover:text-[#A1C2BD] transition-colors duration-300">Passenger</h3>
                  <p className="text-[#708993] mb-8 text-lg leading-relaxed">
                    Book bus tickets, manage your bookings, and enjoy seamless travel experiences.
                  </p>
                  <button 
                    onClick={() => {
                      setActiveForm('passenger');
                      setErrors({});
                      setMsg('');
                    }}
                    className="w-full bg-[#A1C2BD] text-[#19183B] font-bold py-4 rounded-2xl hover:bg-[#E7F2EF] transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
                  >
                    Register as Passenger
                  </button>
                </div>
                
                {/* Operator Registration Card */}
                <div className="bg-[#E7F2EF]/10 backdrop-blur-lg rounded-3xl p-10 border-2 border-[#708993]/30 hover:border-[#A1C2BD] transition-all duration-500 hover:transform hover:scale-105 group">
                  <div className="w-20 h-20 bg-[#A1C2BD] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="8" width="20" height="12" rx="2" fill="#19183B"/>
                      <circle cx="7" cy="18" r="2" fill="#A1C2BD"/>
                      <circle cx="17" cy="18" r="2" fill="#A1C2BD"/>
                      <path d="M6 8V4C6 2.89543 6.89543 2 8 2H16C17.1046 2 18 2.89543 18 4V8" stroke="#19183B" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-[#E7F2EF] mb-6 group-hover:text-[#A1C2BD] transition-colors duration-300">Bus Operator</h3>
                  <p className="text-[#708993] mb-8 text-lg leading-relaxed">
                    Manage bus fleet, routes, schedules, and passenger bookings efficiently.
                  </p>
                  <button 
                    onClick={() => {
                      setActiveForm('operator');
                      setErrors({});
                      setMsg('');
                    }}
                    className="w-full bg-[#A1C2BD] text-[#19183B] font-bold py-4 rounded-2xl hover:bg-[#E7F2EF] transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
                  >
                    Register as Operator
                  </button>
                </div>
                
                {/* Bus Registration Card */}
                <div className="bg-[#E7F2EF]/10 backdrop-blur-lg rounded-3xl p-10 border-2 border-[#708993]/30 hover:border-[#A1C2BD] transition-all duration-500 hover:transform hover:scale-105 group">
                  <div className="w-20 h-20 bg-[#A1C2BD] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                      <path d="M8 4C5.79086 4 4 5.79086 4 8V24C4 26.2091 5.79086 28 8 28H10C10 29.1046 10.8954 30 12 30C13.1046 30 14 29.1046 14 28H18C18 29.1046 18.8954 30 20 30C21.1046 30 22 29.1046 22 28H24C26.2091 28 28 26.2091 28 24V8C28 5.79086 26.2091 4 24 4H8Z" fill="#19183B"/>
                      <path d="M8 12C8 10.8954 8.89543 10 10 10H22C23.1046 10 24 10.8954 24 12V18C24 19.1046 23.1046 20 22 20H10C8.89543 20 8 19.1046 8 18V12Z" fill="#A1C2BD"/>
                      <circle cx="10" cy="24" r="2" fill="#A1C2BD"/>
                      <circle cx="22" cy="24" r="2" fill="#A1C2BD"/>
                      <rect x="6" y="6" width="20" height="2" fill="#A1C2BD"/>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-[#E7F2EF] mb-6 group-hover:text-[#A1C2BD] transition-colors duration-300">Bus Registration</h3>
                  <p className="text-[#708993] mb-8 text-lg leading-relaxed">
                    Register your bus to join our network and start accepting passenger bookings.
                  </p>
                  <button 
                    onClick={() => {
                      setActiveForm('bus');
                      setErrors({});
                      setMsg('');
                    }}
                    className="w-full bg-[#A1C2BD] text-[#19183B] font-bold py-4 rounded-2xl hover:bg-[#E7F2EF] transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
                  >
                    Register Bus
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`max-w-${activeForm === 'bus' ? '6xl' : 'lg'} mx-auto bg-[#E7F2EF]/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-2 border-[#708993]/30`}>
              
              {/* Passenger Registration Form */}
              {(activeForm === 'passenger' || activeForm === 'operator') && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-[#E7F2EF]">
                      {activeForm === 'passenger' ? 'Passenger Registration' : 'Bus Operator Registration'}
                    </h2>
                    <button 
                      onClick={() => setActiveForm('selection')}
                      className="text-[#A1C2BD] font-semibold flex items-center hover:text-[#E7F2EF] transition-colors duration-300"
                    >
                      ← Back
                    </button>
                  </div>
                  {msg && <div className={`mb-6 p-4 rounded-xl ${msg.includes('successfully') ? 'bg-[#A1C2BD]/20 text-[#A1C2BD] border border-[#A1C2BD]/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>{msg}</div>}
                  <form onSubmit={activeForm === 'passenger' ? submitPassenger : submitOperator} className="space-y-6">
                    <div>
                      <input 
                        placeholder={activeForm === 'passenger' ? "Full Name *" : "Company Name *"} 
                        value={userForm.fullName} 
                        onChange={e => setUserForm({...userForm, fullName: e.target.value})} 
                        className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-5 py-4 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                        required
                      />
                      {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
                    </div>
                    
                    <div>
                      <input 
                        placeholder="Username *" 
                        value={userForm.username} 
                        onChange={e => setUserForm({...userForm, username: e.target.value})} 
                        className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-5 py-4 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                        required
                      />
                      {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
                    </div>
                    
                    <div>
                      <input 
                        placeholder="Email *" 
                        type="email"
                        value={userForm.email} 
                        onChange={e => setUserForm({...userForm, email: e.target.value})} 
                        className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-5 py-4 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                        required
                      />
                      {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <input 
                        placeholder="Phone Number *" 
                        value={userForm.phoneNumber} 
                        onChange={e => setUserForm({...userForm, phoneNumber: e.target.value})} 
                        className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-5 py-4 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                        required
                      />
                      {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>
                    
                    <div>
                      <input 
                        placeholder="Password *" 
                        type="password" 
                        value={userForm.password} 
                        onChange={e => setUserForm({...userForm, password: e.target.value})} 
                        className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-5 py-4 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                        required
                      />
                      {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                    </div>
                    
                    <div>
                      <input 
                        placeholder="Confirm Password *" 
                        type="password" 
                        value={userForm.confirmPassword} 
                        onChange={e => setUserForm({...userForm, confirmPassword: e.target.value})} 
                        className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-5 py-4 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                        required
                      />
                      {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-[#A1C2BD] text-[#19183B] font-bold py-4 rounded-xl hover:bg-[#E7F2EF] transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
                    >
                      {activeForm === 'passenger' ? 'Create Passenger Account' : 'Create Operator Account'}
                    </button>
                  </form>
                </div>
              )}

              {/* Bus Registration Form - Remains the same as before */}
              {activeForm === 'bus' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-[#E7F2EF]">Bus Registration</h2>
                    <button 
                      onClick={() => setActiveForm('selection')}
                      className="text-[#A1C2BD] font-semibold flex items-center hover:text-[#E7F2EF] transition-colors duration-300"
                    >
                      ← Back
                    </button>
                  </div>
                  {msg && <div className={`mb-6 p-4 rounded-xl ${msg.includes('successfully') ? 'bg-[#A1C2BD]/20 text-[#A1C2BD] border border-[#A1C2BD]/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>{msg}</div>}
                  
                  <form onSubmit={submitBus} className="space-y-8">
                    {/* Section 1: Basic Bus Information */}
                    <div className="bg-[#19183B]/50 rounded-2xl p-6 border border-[#708993]/20">
                      <h3 className="text-xl font-bold text-[#A1C2BD] mb-4">Basic Bus Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Bus Number *</label>
                          <input 
                            placeholder="e.g., TN01AB1234" 
                            value={busForm.busNumber} 
                            onChange={e => setBusForm({...busForm, busNumber: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.busNumber && <p className="text-red-400 text-sm mt-1">{errors.busNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Registration Number *</label>
                          <input 
                            placeholder="e.g., KA01CD4567" 
                            value={busForm.registrationNumber} 
                            onChange={e => setBusForm({...busForm, registrationNumber: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.registrationNumber && <p className="text-red-400 text-sm mt-1">{errors.registrationNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Bus Type *</label>
                          <select 
                            value={busForm.busType} 
                            onChange={e => setBusForm({...busForm, busType: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          >
                            <option value="" className="bg-[#19183B]">Select Bus Type</option>
                            {busTypes.map(type => (
                              <option key={type} value={type} className="bg-[#19183B]">{type}</option>
                            ))}
                          </select>
                          {errors.busType && <p className="text-red-400 text-sm mt-1">{errors.busType}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Seating Capacity *</label>
                          <input 
                            type="number"
                            placeholder="e.g., 40" 
                            value={busForm.capacity} 
                            onChange={e => setBusForm({...busForm, capacity: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            min="1"
                            required
                          />
                          {errors.capacity && <p className="text-red-400 text-sm mt-1">{errors.capacity}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Operator Information */}
                    <div className="bg-[#19183B]/50 rounded-2xl p-6 border border-[#708993]/20">
                      <h3 className="text-xl font-bold text-[#A1C2BD] mb-4">Operator Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Operator Name *</label>
                          <input 
                            placeholder="e.g., Sharma Travels" 
                            value={busForm.operatorName} 
                            onChange={e => setBusForm({...busForm, operatorName: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.operatorName && <p className="text-red-400 text-sm mt-1">{errors.operatorName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Operator License *</label>
                          <input 
                            placeholder="License Number" 
                            value={busForm.operatorLicense} 
                            onChange={e => setBusForm({...busForm, operatorLicense: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.operatorLicense && <p className="text-red-400 text-sm mt-1">{errors.operatorLicense}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Vehicle Specifications */}
                    <div className="bg-[#19183B]/50 rounded-2xl p-6 border border-[#708993]/20">
                      <h3 className="text-xl font-bold text-[#A1C2BD] mb-4">Vehicle Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Model *</label>
                          <input 
                            placeholder="e.g., Volvo 9400" 
                            value={busForm.model} 
                            onChange={e => setBusForm({...busForm, model: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.model && <p className="text-red-400 text-sm mt-1">{errors.model}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Manufacturing Year *</label>
                          <input 
                            type="number"
                            placeholder="e.g., 2022" 
                            min="2000"
                            max={new Date().getFullYear()}
                            value={busForm.year} 
                            onChange={e => setBusForm({...busForm, year: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Fuel Type *</label>
                          <select 
                            value={busForm.fuelType} 
                            onChange={e => setBusForm({...busForm, fuelType: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          >
                            <option value="" className="bg-[#19183B]">Select Fuel Type</option>
                            {fuelTypes.map(type => (
                              <option key={type} value={type} className="bg-[#19183B]">{type}</option>
                            ))}
                          </select>
                          {errors.fuelType && <p className="text-red-400 text-sm mt-1">{errors.fuelType}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Insurance Details */}
                    <div className="bg-[#19183B]/50 rounded-2xl p-6 border border-[#708993]/20">
                      <h3 className="text-xl font-bold text-[#A1C2BD] mb-4">Insurance Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Insurance Number *</label>
                          <input 
                            placeholder="Insurance Policy Number" 
                            value={busForm.insuranceNumber} 
                            onChange={e => setBusForm({...busForm, insuranceNumber: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] placeholder-[#708993] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.insuranceNumber && <p className="text-red-400 text-sm mt-1">{errors.insuranceNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#E7F2EF] mb-2">Insurance Expiry *</label>
                          <input 
                            type="date"
                            value={busForm.insuranceExpiry} 
                            onChange={e => setBusForm({...busForm, insuranceExpiry: e.target.value})} 
                            className="w-full bg-[#19183B] border-2 border-[#708993]/30 px-4 py-3 rounded-xl text-[#E7F2EF] focus:border-[#A1C2BD] focus:ring-2 focus:ring-[#A1C2BD]/20 transition-all duration-300"
                            required
                          />
                          {errors.insuranceExpiry && <p className="text-red-400 text-sm mt-1">{errors.insuranceExpiry}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Amenities & Facilities */}
                    <div className="bg-[#19183B]/50 rounded-2xl p-6 border border-[#708993]/20">
                      <h3 className="text-xl font-bold text-[#A1C2BD] mb-4">Amenities & Facilities</h3>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#E7F2EF] mb-3">Passenger Amenities</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {amenitiesList.map(amenity => (
                            <div key={amenity} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`amenity-${amenity}`}
                                checked={busForm.amenities.includes(amenity)}
                                onChange={() => handleAmenityChange(amenity)}
                                className="w-4 h-4 text-[#A1C2BD] focus:ring-[#A1C2BD] border-gray-300 rounded"
                              />
                              <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-[#E7F2EF]">
                                {amenity}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#E7F2EF] mb-3">Safety & Technical Facilities</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {facilitiesList.map(facility => (
                            <div key={facility} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`facility-${facility}`}
                                checked={busForm.facilities.includes(facility)}
                                onChange={() => handleFacilityChange(facility)}
                                className="w-4 h-4 text-[#A1C2BD] focus:ring-[#A1C2BD] border-gray-300 rounded"
                              />
                              <label htmlFor={`facility-${facility}`} className="ml-2 text-sm text-[#E7F2EF]">
                                {facility}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#A1C2BD] text-[#19183B] font-bold py-4 rounded-xl hover:bg-[#E7F2EF] transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
                    >
                      Register Bus
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
          
          {/* Login Link */}
          <div className="text-center mt-12">
            <p className="text-[#708993] text-lg">
              Already have an account? 
              <Link to="/login" className="text-[#A1C2BD] font-semibold hover:text-[#E7F2EF] transition-colors duration-300 ml-2">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}