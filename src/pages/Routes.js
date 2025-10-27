import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../api/axios';

const Routes = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await api.get('/api/routes');
        const routesData = response.data.content || response.data;
        setRoutes(routesData);
        setFilteredRoutes(routesData);
      } catch (error) {
        console.error('Error loading routes:', error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };
    loadRoutes();
  }, []);

  useEffect(() => {
    let filtered = routes.filter(route =>
      route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort routes
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return b.distanceKm - a.distanceKm;
        case "duration":
          return b.durationMinutes - a.durationMinutes;
        case "alphabetical":
          return a.source.localeCompare(b.source);
        case "popularity":
        default:
          return (Math.random() * 1000) - (Math.random() * 1000);
      }
    });

    setFilteredRoutes(filtered);
  }, [searchTerm, routes, sortBy]);

  const popularRoutes = filteredRoutes.map(route => ({
    id: route.id || route.routeId,
    from: route.source,
    to: route.destination,
    price: `₹${500 + Math.floor(Math.random() * 500)}`,
    duration: `${Math.floor(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m`,
    buses: "Multiple buses daily",
    operator: "Verified Operators",
    distance: `${route.distanceKm} km`,
    popularity: Math.floor(Math.random() * 1000) + 500,
    rating: (Math.random() * 1 + 4).toFixed(1),
    amenities: ["AC", "WiFi", "Charging", "Sleeper"].slice(0, 2 + Math.floor(Math.random() * 2))
  }));

  const RouteCard = ({ route, index }) => (
    <div 
      className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-brand-primary/60 transition-all duration-700 cursor-pointer hover:shadow-2xl transform hover:-translate-y-3 group relative overflow-hidden"
      onClick={() => {
        const today = new Date().toISOString().split('T')[0];
        navigate('/vehicles', { 
          state: { 
            from: route.from, 
            to: route.to, 
            departureDate: today, 
            passengers: 1 
          } 
        });
      }}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      {/* Animated Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/5 to-brand-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:skew-x-0 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        {/* Route Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-400">LIVE</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors duration-300 leading-tight">
              {route.from} 
              <span className="text-white/60 mx-2 group-hover:text-brand-primary/70">→</span> 
              {route.to}
            </h3>
            <p className="text-white/70 text-sm mt-1">{route.duration} • {route.distance}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-brand-primary group-hover:scale-110 transition-transform duration-300 bg-white/10 rounded-lg px-3 py-1">
              {route.price}
            </div>
            <div className="text-white/60 text-xs mt-1">per person</div>
          </div>
        </div>

        {/* Route Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-white/80">
              <span className="mr-1">⭐</span>
              <span>{route.rating}</span>
            </div>
            <div className="flex items-center text-sm text-white/80">
              <span className="mr-1">👥</span>
              <span>{route.popularity}+</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-sm">{route.buses}</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {route.amenities.map((amenity, idx) => (
            <span 
              key={idx}
              className="bg-white/10 text-white/90 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border border-white/20 group-hover:border-brand-primary/30 transition-colors duration-300"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-4 backdrop-blur-sm">
          <div 
            className="bg-gradient-to-r from-green-400 to-brand-primary h-2 rounded-full transition-all duration-1000 group-hover:from-brand-primary group-hover:to-green-400"
            style={{ width: `${Math.min(90, 30 + (route.popularity / 20))}%` }}
          ></div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-brand-primary to-purple-600 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-brand-primary transition-all duration-500 transform group-hover:scale-105 shadow-lg group-hover:shadow-xl border border-white/20">
          Book This Route
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
        </button>
      </div>
    </div>
  );

  // Floating particles for background
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/5 backdrop-blur-sm"
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Gradient Background */}
      <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20 animate-pulse-slow"></div>
        {/* Sparkle Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/70"></div>
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-black text-white hover:text-brand-primary transition-all duration-300 transform hover:scale-105">
                <span className="bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent">
                  🚌 BoardEasy
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white/80 hover:text-brand-primary transition-all duration-300 font-semibold hover:scale-105">
                Home
              </Link>
              <Link to="/routes" className="text-brand-primary font-semibold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-brand-primary/30">
                Routes
              </Link>
              <Link to="/vehicles" className="text-white/80 hover:text-brand-primary transition-all duration-300 font-semibold hover:scale-105">
                Book Now
              </Link>
              <Link to="/bookings" className="text-white/80 hover:text-brand-primary transition-all duration-300 font-semibold hover:scale-105">
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Header Section */}
        <section className="py-20 bg-transparent">
          <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-brand-primary to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-white/20 animate-pulse">
                🎯 Explore All Routes
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 bg-gradient-to-r from-white via-white to-brand-primary bg-clip-text text-transparent">
                Discover Routes
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                Explore <span className="text-brand-primary font-semibold">5000+ bus routes</span> across India with BoardEasy's premium network
              </p>
              
              {/* Enhanced Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="🔍 Search routes by city or destination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-2 border-white/20 rounded-2xl p-4 pl-12 text-white placeholder-white/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 transition-all duration-500 bg-white/10 backdrop-blur-xl shadow-2xl group-hover:border-brand-primary/50"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 group-hover:text-brand-primary transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button
                    onClick={() => setSortBy("popularity")}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border ${
                      sortBy === "popularity" 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg' 
                        : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    🏆 Popular
                  </button>
                  <button
                    onClick={() => setSortBy("distance")}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border ${
                      sortBy === "distance" 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg' 
                        : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    📍 Distance
                  </button>
                  <button
                    onClick={() => setSortBy("duration")}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border ${
                      sortBy === "duration" 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg' 
                        : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    ⏱️ Duration
                  </button>
                  <button
                    onClick={() => setSortBy("alphabetical")}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border ${
                      sortBy === "alphabetical" 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg' 
                        : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    🔤 A-Z
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 bg-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: "5000+", label: "Routes" },
                { number: "200+", label: "Cities" },
                { number: "50K+", label: "Travelers" },
                { number: "4.8★", label: "Rating" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 hover:border-brand-primary/50 transition-all duration-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-black text-brand-primary mb-2">{stat.number}</div>
                  <div className="text-white/70 text-sm font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Routes Section */}
        <section className="py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand-primary border-t-transparent"></div>
                <p className="text-white/80 mt-4 text-lg">Loading amazing routes for you...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-white/80 text-lg">
                      <span className="text-brand-primary font-bold">{filteredRoutes.length}</span> routes found
                      {searchTerm && (
                        <span className="text-white/60"> for "{searchTerm}"</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {popularRoutes.map((route, index) => (
                    <RouteCard key={route.id || index} route={route} index={index} />
                  ))}
                </div>
                
                {filteredRoutes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 max-w-2xl mx-auto">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-2xl font-bold text-white mb-4">No routes found</h3>
                      <p className="text-white/60 text-lg mb-6">
                        We couldn't find any routes matching your search. Try different keywords or browse all routes.
                      </p>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="bg-gradient-to-r from-brand-primary to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-brand-primary transition-all duration-500 transform hover:scale-105"
                      >
                        Show All Routes
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-transparent">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-brand-primary/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                Can't Find Your Route?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Let us help you find the perfect route. Our customer support team is available 24/7 to assist you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/support"
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  📞 Contact Support
                </Link>
                <Link
                  to="/"
                  className="bg-transparent text-white px-8 py-4 rounded-xl font-bold border-2 border-white/30 hover:border-white transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                >
                  🏠 Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Routes;