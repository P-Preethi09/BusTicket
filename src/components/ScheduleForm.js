import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ScheduleForm = ({ onScheduleAdded, onClose }) => {
  const [formData, setFormData] = useState({
    routeId: '',
    vehicleId: '',
    departureTime: '',
    arrivalTime: '',
    scheduleDate: '',
    basePrice: '',
    availableSeats: ''
  });
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
    fetchVehicles();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/api/routes?size=1000');
      const routesData = response.data;
      setRoutes(routesData.content || routesData || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles?size=1000');
      const vehiclesData = response.data;
      setVehicles(vehiclesData.content || vehiclesData || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduleData = {
        route: { id: parseInt(formData.routeId) },
        vehicle: { id: parseInt(formData.vehicleId) },
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        scheduleDate: formData.scheduleDate,
        basePrice: parseFloat(formData.basePrice),
        availableSeats: parseInt(formData.availableSeats),
        isActive: true
      };

      await api.post('/api/schedules', scheduleData);
      alert('Schedule added successfully!');
      onScheduleAdded();
      onClose();
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Failed to add schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
            <select
              value={formData.routeId}
              onChange={(e) => setFormData({...formData, routeId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.source} → {route.destination}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.operator || 'Unknown Operator'} - {vehicle.vehicleNumber} ({vehicle.vehicleType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
            <input
              type="date"
              value={formData.scheduleDate}
              onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
              <input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Seats</label>
              <input
                type="number"
                min="1"
                value={formData.availableSeats}
                onChange={(e) => setFormData({...formData, availableSeats: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Schedule'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;