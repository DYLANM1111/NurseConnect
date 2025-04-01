import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllShifts, deleteShift } from '../services/shiftService';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ShiftList = () => {
  const { isAdmin, currentFacility } = useAuth();
  
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterApplied, setFilterApplied] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  useEffect(() => {
    fetchShifts();
  }, []);
  
  const fetchShifts = async () => {
    try {
      setLoading(true);
      
      // Only filter by facility on the server side
      const filters = {};
      
      // Always filter by current facility ID
      if (currentFacility && currentFacility.id) {
        filters.facility_id = currentFacility.id;
      }
      
      console.log('Fetching all shifts for facility:', currentFacility?.id);
      
      // Make API request to get all shifts for this facility
      const response = await getAllShifts(filters);
      
      console.log('Received shifts from server:', response.length);
      
      // Store all shifts
      setShifts(response);
      
      // Initially show all shifts for the facility
      setFilteredShifts(response);
      
      // Extract available dates for filtering
      const dates = response.map(shift => {
        // Extract just the date part in YYYY-MM-DD format
        return new Date(shift.start_time).toISOString().split('T')[0];
      });
      
      // Get unique dates and sort them
      const uniqueDates = [...new Set(dates)].sort();
      setAvailableDates(uniqueDates);
      
      console.log('Available dates for filtering:', uniqueDates);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError('Failed to fetch shifts: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };
  
  // Apply filters on the client side - only called when Apply Filters button is clicked
  const applyFilters = () => {
    console.log('Applying client-side filters - Status:', selectedStatus, 'Date:', filterDate);
    
    // Start with all shifts
    let result = [...shifts];
    let filterWasApplied = false;
    
    // Apply status filter if selected
    if (selectedStatus && selectedStatus !== '') {
      console.log('Filtering by status:', selectedStatus);
      result = result.filter(shift => shift.status === selectedStatus);
      filterWasApplied = true;
      
      console.log('After status filter, shifts remaining:', result.length);
    }
    
    // Apply date filter if selected
    if (filterDate && filterDate !== '') {
      console.log('Filtering by date:', filterDate);
      
      // The date filter from the input is already in YYYY-MM-DD format
      result = result.filter(shift => {
        // Extract just the date part from shift.start_time
        const shiftDate = new Date(shift.start_time).toISOString().split('T')[0];
        
        // Debug logs for each shift
        console.log(`Shift ID ${shift.id} - comparing dates:`, {
          shiftDate: shiftDate,
          filterDate: filterDate,
          matches: shiftDate === filterDate
        });
        
        return shiftDate === filterDate;
      });
      
      filterWasApplied = true;
      console.log('After date filter, shifts remaining:', result.length);
    }
    
    setFilterApplied(filterWasApplied);
    setFilteredShifts(result);
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
    console.log('Filter button clicked. Status:', selectedStatus, 'Date:', filterDate);
    applyFilters();
  };
  
  const clearFilters = () => {
    console.log('Clearing filters');
    setSelectedStatus('');
    setFilterDate('');
    setFilterApplied(false);
    // When clearing filters, show all shifts for the facility
    setFilteredShifts(shifts);
  };
  
  // Debug information display
  const renderDebugInfo = () => {
    if (!isAdmin()) return null;
    
    return (
      <div className="bg-gray-100 p-4 my-4 rounded-lg text-xs">
        <h4 className="font-bold mb-2">Debug Information</h4>
        <p>Current facility ID: {currentFacility?.id || 'Unknown'}</p>
        <p>Selected status: "{selectedStatus}"</p>
        <p>Selected date: "{filterDate}"</p>
        <p>Total shifts from server: {shifts.length}</p>
        <p>Filtered shifts displayed: {filteredShifts.length}</p>
        <p>Filter applied: {filterApplied ? 'Yes' : 'No'}</p>
        
        {shifts.length > 0 && (
          <div>
            <p className="font-bold mt-2">First shift details:</p>
            <p>- ID: {shifts[0].id}</p>
            <p>- Status: "{shifts[0].status}"</p>
            <p>- Raw date value: {shifts[0].start_time}</p>
            <p>- Formatted date: {new Date(shifts[0].start_time).toISOString().split('T')[0]}</p>
            
            <p className="font-bold mt-2">Status types present:</p>
            <ul className="list-disc pl-5">
              {Array.from(new Set(shifts.map(shift => shift.status))).map(status => (
                <li key={status}>{status}</li>
              ))}
            </ul>
            
            <p className="font-bold mt-2">Available dates for filtering:</p>
            <ul className="list-disc pl-5">
              {availableDates.map(date => (
                <li key={date}>{date}</li>
              ))}
            </ul>
            
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded">
              <p className="font-bold">Quick Copy Available Dates:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {availableDates.map(date => (
                  <button
                    key={date}
                    onClick={() => {
                      setFilterDate(date);
                      console.log('Set date to:', date);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
  
  // Use filtered shifts for display
  const displayShifts = filteredShifts;
  
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              className="form-input"
              value={selectedStatus}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Selected status:', value);
                setSelectedStatus(value);
              }}
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
              onChange={(e) => {
                const value = e.target.value;
                console.log('Selected date:', value);
                setFilterDate(value);
              }}
            />
            {availableDates.length > 0 && isAdmin() && (
              <div className="text-xs text-gray-500 mt-1">
                Available dates: {availableDates.slice(0, 3).join(', ')}
                {availableDates.length > 3 ? ' ...' : ''}
              </div>
            )}
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
      
      {/* Debug information for troubleshooting */}
      {renderDebugInfo()}
      
      {displayShifts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">
            {filterApplied 
              ? 'No shifts found for your facility with the selected filters.'
              : 'No shifts found for your facility.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                {displayShifts.map((shift) => (
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