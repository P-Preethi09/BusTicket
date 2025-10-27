import React, { useState } from 'react';
import api from '../api/axios';

const RouteForm = ({ onRouteAdded, onClose }) => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    distanceKm: '',
    durationMinutes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const routeData = {
        ...formData,
        distanceKm: parseInt(formData.distanceKm),
        durationMinutes: parseInt(formData.durationMinutes)
      };
      
      await api.post('/api/routes', routeData);
      onRouteAdded();
      onClose();
      setFormData({ source: '', destination: '', distanceKm: '', durationMinutes: '' });
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Route</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source City</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination City</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
            <input
              type="number"
              value={formData.distanceKm}
              onChange={(e) => setFormData({...formData, distanceKm: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Route'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteForm;