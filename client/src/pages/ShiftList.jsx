// client/src/pages/ShiftList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllShifts, deleteShift } from '../services/shiftService';
import { getAllFacilities } from '../services/facilityService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ShiftList = () => {
  const { isAdmin } = useAuth();
  
  const [shifts, setShifts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  useEffect(() => {
    fetchFacilities();
    fetchShifts();
  }, []);
  
  const fetchFacilities = async () => {
    try {
      const response = await getAllFacilities();
      setFacilities(response);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to fetch facilities');
    }
  };
  
  const fetchShifts = async () => {
    try {
      setLoading(true);
      
      // Prepare filter parameters
      const filters = {};
      if (selectedFacility) filters.facility_id = selectedFacility;
      if (selectedStatus) filters.status = selectedStatus;
      if (filterDate) filters.startDate = new Date(filterDate);
      
      const response = await getAllShifts(filters);
      setShifts(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError('Failed to fetch shifts');
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteShift(id);
        toast.success('Shift deleted successfully');
        fetchShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast.error('Failed to delete shift');
      }
    }
  };
  
  const handleFilterChange = () => {
    fetchShifts();
  };
  
  const clearFilters = () => {
    setSelectedFacility('');
    setSelectedStatus('');
    setFilterDate('');
    
    // Reset and fetch all shifts
    setTimeout(() => {
      fetchShifts();
    }, 0);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Shifts</h1>
        
        {isAdmin() && (
          <Link
            to="/shifts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <FaPlus className="mr-2" />
            Add Shift
          </Link>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg">
        <div className="flex items-center mb-4">
          <FaFilter className="text-gray-400 mr-2" />
          <h3 className="text-lg font-medium">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="facility-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Facility
            </label>
            <select
              id="facility-filter"
              className="form-input"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
            >
              <option value="">All Facilities</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="date-filter"
              type="date"
              className="form-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={handleFilterChange}
              className="btn btn-primary"
            >
              Apply Filters
            </button>
            
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {shifts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">No shifts found.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shift.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(shift.start_time), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${shift.hourly_rate}/hr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shift.status === 'open' 
                          ? 'bg-green-100 text-green-800'
                          : shift.status === 'assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : shift.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-4">
                        <Link
                          to={`/shifts/${shift.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                        
                        {isAdmin() && (
                          <>
                            <Link
                              to={`/shifts/edit/${shift.id}`}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <FaEdit />
                            </Link>
                            
                            <button
                              onClick={() => handleDelete(shift.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftList;