import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import RoutesPage from './pages/Routes';
import Login from './pages/Login';
import Register from './pages/Register';

import BusSearch from './pages/BusSearch';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import Bookings from './pages/Bookings';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import BookingManagement from './pages/BookingManagement';
import PartnerWithUs from './pages/PartnerWithUs';
import Support from './pages/Support';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-transparent">
          <Navbar />
          <Routes>
          <Route path="/" element={<main className="container mx-auto px-4 py-8"><Landing /></main>} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/bus-search" element={<BusSearch />} />
          <Route path="/seat-selection" element={<SeatSelection />} />
          <Route path="/passenger-details" element={<PassengerDetails />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/bookings" element={<main className="container mx-auto px-4 py-8"><Bookings /></main>} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<BookingManagement />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/support" element={<Support />} />
          </Routes>
        </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
