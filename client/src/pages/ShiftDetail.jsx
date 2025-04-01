import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getShiftById, deleteShift } from '../services/shiftService';
import { useAuth } from '../context/AuthContext';
import { format, differenceInHours } from 'date-fns';
import { FaEdit, FaTrash, FaCalendarAlt, FaClock, FaDollarSign, FaHospital } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ShiftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, currentFacility } = useAuth();
  
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchShift = async () => {
      try {
        setLoading(true);
        
        const shiftData = await getShiftById(id);
        setShift(shiftData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shift data:', error);
        setError('Failed to fetch shift details');
        setLoading(false);
      }
    };
    
    fetchShift();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteShift(id);
        toast.success('Shift deleted successfully');
        navigate('/shifts');
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast.error('Failed to delete shift');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/shifts/edit/${id}`);
  };
  
  // Check if current facility matches the shift's facility
  const canEdit = () => {
    if (!shift || !currentFacility) return false;
    return shift.facility_id === currentFacility.id;
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
  
  if (!shift) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="text-sm text-yellow-700">Shift not found</div>
      </div>
    );
  }
  
  // Calculate shift duration in hours
  const shiftDuration = differenceInHours(new Date(shift.end_time), new Date(shift.start_time));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Shift Details
        </h1>
        
        <div className="flex space-x-4">
          <Link
            to="/shifts"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Shifts
          </Link>
          
          {canEdit() && (
            <>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              >
                <FaEdit className="mr-2" />
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <FaHospital className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Facility Information</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Facility:</span>
                  <p className="mt-1">
                    <Link to={`/facilities/${shift.facility_id}`} className="text-primary-600 hover:text-primary-900">
                      {shift.facility_name}
                    </Link>
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Unit:</span>
                  <p className="mt-1">{shift.unit}</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Date:</span>
                  <p className="mt-1">{format(new Date(shift.start_time), 'EEEE, MMMM dd, yyyy')}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Time:</span>
                  <p className="mt-1">
                    {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                    <span className="ml-2 text-sm text-gray-500">({shiftDuration} hours)</span>
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Shift Type:</span>
                  <p className="mt-1">{shift.shift_type}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <FaDollarSign className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Compensation</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Hourly Rate:</span>
                  <p className="mt-1">${shift.hourly_rate}/hour</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Total Pay:</span>
                  <p className="mt-1">${(shift.hourly_rate * shiftDuration).toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <FaClock className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Status</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Current Status:</span>
                  <p className="mt-1">
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
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {shift.requirements && shift.requirements.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
              
              <ul className="list-disc pl-5 space-y-2">
                {shift.requirements.map((requirement, index) => (
                  <li key={index} className="text-gray-700">{requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftDetail;