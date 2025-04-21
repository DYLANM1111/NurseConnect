import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getShiftById, deleteShift } from '../services/shiftService';
import { useAuth } from '../context/AuthContext';
import { format, differenceInHours } from 'date-fns';
import { FaEdit, FaTrash, FaCalendarAlt, FaClock, FaDollarSign, FaHospital, FaUserCheck, FaUserTimes, FaStar, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ShiftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, currentFacility } = useAuth();

  const [shift, setShift] = useState(null);
  const [applications, setApplications] = useState([]);
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

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage or another storage mechanism
        const response = await fetch(`http://localhost:8080/api/shifts/${id}/applications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const applicationsData = await response.json();
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to fetch applications');
      }
    };

    fetchShift();
    fetchApplications();
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

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token for authentication
      const response = await fetch(`http://localhost:8080/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      const updatedApplication = await response.json();
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);

      // Update the applications list
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: updatedApplication.status } : app
        )
      );

      // If the application is approved, update the shift status to "assigned"
      if (status === 'approved') {
        setShift((prevShift) => ({
          ...prevShift,
          status: 'assigned',
        }));
        toast.success('Shift status updated to "assigned".');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleShiftStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token for authentication
      const response = await fetch(`http://localhost:8080/api/shifts/${shift.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shift status');
      }

      const updatedShift = await response.json();
      setShift(updatedShift);
      toast.success(`Shift status updated to "${newStatus}".`);
    } catch (error) {
      console.error('Error updating shift status:', error);
      toast.error('Failed to update shift status');
    }
  };

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
                <FaHospital className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Specialty</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Specialty:</span>
                  <p className="mt-1">{shift.specialty || 'Not specified'}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Urgent Fill:</span>
                  <p className="mt-1">{shift.urgent_fill ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <FaStar className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Facility Rating</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Rating:</span>
                  <p className="mt-1">{shift.facility_rating ? `${shift.facility_rating}/5` : 'Not rated'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <FaInfoCircle className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Details:</span>
                  <p className="mt-1">{shift.description || 'No description provided'}</p>
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500 mt-4">No applications for this shift yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="p-4 bg-white shadow rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-gray-900 font-medium">{application.nurse_name}</p>
                  <p className="text-gray-500 text-sm">Specialty: {application.specialty}</p>
                  <p className="text-gray-500 text-sm">Years of Experience: {application.years_experience}</p>
                  <p className="text-gray-500 text-sm">Description: {application.nurse_description}</p>
                  <p
                    className={`text-sm font-medium ${
                      application.status === 'approved'
                        ? 'text-green-600'
                        : application.status === 'rejected'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Status: {application.status}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {application.status === 'approved' ? (
                    <p className="text-green-600 font-medium">Approved</p>
                  ) : application.status === 'rejected' ? (
                    <p className="text-red-600 font-medium">Rejected</p>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApplicationStatus(application.id, 'approved')}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        disabled={shift.status !== 'open'} // Disable if shift is not open
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApplicationStatus(application.id, 'rejected')}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftDetail;

