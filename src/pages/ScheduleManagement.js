import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    routeId: '',
    vehicleId: '',
    departureTime: '',
    arrivalTime: '',
    availableSeats: '',
    basePrice: '',
    scheduleDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchSchedules();
    fetchRoutes();
    fetchVehicles();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/api/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/api/routes');
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles');
      setVehicles(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        ...formData,
        route: { id: formData.routeId },
        vehicle: { id: formData.vehicleId },
        availableSeats: parseInt(formData.availableSeats),
        basePrice: parseFloat(formData.basePrice)
      };
      await api.post('/api/schedules', scheduleData);
      fetchSchedules();
      setFormData({
        routeId: '', vehicleId: '', departureTime: '', arrivalTime: '',
        availableSeats: '', basePrice: '', scheduleDate: '', isActive: true
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Schedule Management</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.routeId}
            onChange={(e) => setFormData({...formData, routeId: e.target.value})}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Select Route</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.source} → {route.destination}
              </option>
            ))}
          </select>
          
          <select
            value={formData.vehicleId}
            onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicleNumber} - {vehicle.vehicleType}
              </option>
            ))}
          </select>
          
          <input
            type="time"
            placeholder="Departure Time"
            value={formData.departureTime}
            onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
          
          <input
            type="time"
            placeholder="Arrival Time"
            value={formData.arrivalTime}
            onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
          
          <input
            type="number"
            placeholder="Available Seats"
            value={formData.availableSeats}
            onChange={(e) => setFormData({...formData, availableSeats: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
          
          <input
            type="number"
            step="0.01"
            placeholder="Base Price"
            value={formData.basePrice}
            onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
          
          <input
            type="date"
            value={formData.scheduleDate}
            onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
            className="border rounded px-3 py-2"
            required
          />
        </div>
        
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Create Schedule
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Departure</th>
              <th className="px-4 py-3 text-left">Arrival</th>
              <th className="px-4 py-3 text-left">Seats</th>
              <th className="px-4 py-3 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(schedule => (
              <tr key={schedule.id} className="border-t">
                <td className="px-4 py-4">{schedule.route?.source} → {schedule.route?.destination}</td>
                <td className="px-4 py-4">{schedule.vehicle?.vehicleNumber}</td>
                <td className="px-4 py-4">{schedule.scheduleDate}</td>
                <td className="px-4 py-4">{schedule.departureTime}</td>
                <td className="px-4 py-4">{schedule.arrivalTime}</td>
                <td className="px-4 py-4">{schedule.availableSeats}</td>
                <td className="px-4 py-4">₹{schedule.basePrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleManagement;