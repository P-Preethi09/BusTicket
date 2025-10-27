import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const BusSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 2000],
    departureTime: 'all',
    busType: 'all',
    operator: 'all'
  });
  const [operators, setOperators] = useState([]);

  const searchData = location.state || {};

  useEffect(() => {
    console.log('BusSearch received search data:', searchData);
    
    if (searchData.from && searchData.to && searchData.departureDate) {
      console.log('Valid search data found, initiating search...');
      searchBuses();
      loadOperators();
    } else {
      console.log('Missing search data:', {
        from: searchData.from,
        to: searchData.to,
        departureDate: searchData.departureDate
      });
    }
  }, []);

  const searchBuses = async () => {
    setLoading(true);
    try {
      const searchPayload = {
        source: searchData.from,
        destination: searchData.to,
        travelDate: searchData.departureDate,
        passengers: searchData.passengers || 1
      };
      
      console.log('Searching buses with payload:', searchPayload);
      
      const response = await api.post('/api/bus-search/search', searchPayload);
      
      console.log('Bus search response:', response.data);
      
      setBuses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error searching buses:', error);
      console.error('Error details:', error.response?.data);
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      const response = await api.get('/api/bus-search/operators');
      setOperators(response.data);
    } catch (error) {
      console.error('Error loading operators:', error);
    }
  };

  const filteredBuses = buses.filter(bus => {
    const price = parseFloat(bus.price);
    const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];
    const matchesOperator = filters.operator === 'all' || bus.operatorName === filters.operator;
    const matchesBusType = filters.busType === 'all' || bus.vehicleType.toLowerCase().includes(filters.busType);
    
    let matchesTime = true;
    if (filters.departureTime !== 'all') {
      const hour = bus.departureTime.split(':')[0];
      switch (filters.departureTime) {
        case 'morning': matchesTime = hour >= 6 && hour < 12; break;
        case 'afternoon': matchesTime = hour >= 12 && hour < 18; break;
        case 'evening': matchesTime = hour >= 18 && hour < 24; break;
        case 'night': matchesTime = hour >= 0 && hour < 6; break;
      }
    }
    
    return matchesPrice && matchesOperator && matchesBusType && matchesTime;
  });

  const bookBus = (bus) => {
    navigate('/seat-selection', { state: { bus, searchData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Searching for buses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">
                ← Back to Search
              </button>
              <div className="text-lg font-semibold">
                {searchData.from} → {searchData.to}
              </div>
              <div className="text-gray-600">
                {new Date(searchData.departureDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredBuses.length} buses found
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})}
                    className="flex-1"
                  />
                  <span className="text-sm">₹{filters.priceRange[1]}</span>
                </div>
              </div>

              {/* Departure Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Departure Time</label>
                <select
                  value={filters.departureTime}
                  onChange={(e) => setFilters({...filters, departureTime: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="all">All Times</option>
                  <option value="morning">Morning (6AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 12AM)</option>
                  <option value="night">Night (12AM - 6AM)</option>
                </select>
              </div>

              {/* Bus Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Bus Type</label>
                <select
                  value={filters.busType}
                  onChange={(e) => setFilters({...filters, busType: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="all">All Types</option>
                  <option value="ac">AC</option>
                  <option value="non-ac">Non-AC</option>
                  <option value="sleeper">Sleeper</option>
                  <option value="seater">Seater</option>
                </select>
              </div>

              {/* Operator */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Operator</label>
                <select
                  value={filters.operator}
                  onChange={(e) => setFilters({...filters, operator: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="all">All Operators</option>
                  {operators.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bus List */}
          <div className="lg:col-span-3">
            {filteredBuses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBuses.map(bus => (
                  <div key={bus.scheduleId} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{bus.operatorName}</h3>
                          <p className="text-sm text-gray-600">{bus.vehicleType} • {bus.vehicleNumber}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600 ml-1">{bus.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Departure</p>
                          <p className="font-semibold">{bus.departureTime}</p>
                          <p className="text-sm text-gray-600">{bus.source}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-semibold">{bus.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Arrival</p>
                          <p className="font-semibold">{bus.arrivalTime}</p>
                          <p className="text-sm text-gray-600">{bus.destination}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-2xl font-bold text-green-600">₹{bus.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            {bus.amenities?.map((amenity, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">
                            {bus.availableSeats} seats available
                          </div>
                        </div>
                        <button
                          onClick={() => bookBus(bus)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                        >
                          Select Seats
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusSearch;