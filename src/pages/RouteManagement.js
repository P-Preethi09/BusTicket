import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    distanceKm: '',
    durationMinutes: ''
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/api/routes');
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/routes/${editing}`, formData);
      } else {
        await api.post('/api/routes', formData);
      }
      fetchRoutes();
      setFormData({ source: '', destination: '', distanceKm: '', durationMinutes: '' });
      setEditing(null);
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  const handleEdit = (route) => {
    setFormData(route);
    setEditing(route.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/routes/${id}`);
      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Route Management</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Source"
            value={formData.source}
            onChange={(e) => setFormData({...formData, source: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Destination"
            value={formData.destination}
            onChange={(e) => setFormData({...formData, destination: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Distance (km)"
            value={formData.distanceKm}
            onChange={(e) => setFormData({...formData, distanceKm: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          {editing ? 'Update Route' : 'Add Route'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Source</th>
              <th className="px-6 py-3 text-left">Destination</th>
              <th className="px-6 py-3 text-left">Distance</th>
              <th className="px-6 py-3 text-left">Duration</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.id} className="border-t">
                <td className="px-6 py-4">{route.source}</td>
                <td className="px-6 py-4">{route.destination}</td>
                <td className="px-6 py-4">{route.distanceKm} km</td>
                <td className="px-6 py-4">{route.durationMinutes} min</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(route)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(route.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RouteManagement;