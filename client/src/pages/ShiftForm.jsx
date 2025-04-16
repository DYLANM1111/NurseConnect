import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createShift, updateShift, getShiftById } from '../services/shiftService';
import { getAllFacilities } from '../services/facilityService';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const shiftSchema = Yup.object().shape({
  facility_id: Yup.string().required('Facility is required'),
  unit: Yup.string().required('Unit is required'),
  shift_type: Yup.string().required('Shift type is required'),
  start_time: Yup.date().required('Start time is required'),
  end_time: Yup.date()
    .required('End time is required')
    .min(
      Yup.ref('start_time'),
      'End time must be after start time'
    ),
  hourly_rate: Yup.number()
    .required('Hourly rate is required')
    .positive('Hourly rate must be positive')
    .min(0, 'Hourly rate must be at least 0'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['open', 'assigned', 'completed', 'cancelled'], 'New shifts must have "open" status'),
  requirements: Yup.array().of(Yup.string())
});

const ShiftForm = ({ isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentFacility } = useAuth();
  
  const [shift, setShift] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all facilities
        const facilitiesData = await getAllFacilities();
        setFacilities(facilitiesData);
        
        // If editing, fetch shift data
        if (isEdit && id) {
          const shiftData = await getShiftById(id);
          
          // Format dates for form inputs
          shiftData.start_time = format(new Date(shiftData.start_time), "yyyy-MM-dd'T'HH:mm");
          shiftData.end_time = format(new Date(shiftData.end_time), "yyyy-MM-dd'T'HH:mm");
          
          setShift(shiftData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEdit]);
  
  // For a new shift (not editing), calculate the initialValues
  const getInitialValues = () => {
    if (isEdit && shift) {
      // If editing, use the shift data
      return {
        facility_id: shift.facility_id || '',
        unit: shift.unit || '',
        shift_type: shift.shift_type || '',
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        hourly_rate: shift.hourly_rate || '',
        status: shift.status || 'open',
        requirements: shift.requirements || []
      };
    } else {
      // For a new shift, set default values
      // If currentFacility is available, pre-select it
      return {
        facility_id: currentFacility?.id || '',
        unit: '',
        shift_type: '',
        start_time: '',
        end_time: '',
        hourly_rate: '',
        status: 'open', // Always set to 'open' for new shifts
        requirements: []
      };
    }
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Always ensure status is 'open' for new shifts
      if (!isEdit) {
        values.status = 'open';
      }
      
      if (isEdit) {
        await updateShift(id, values);
        toast.success('Shift updated successfully');
      } else {
        await createShift(values);
        toast.success('Shift created successfully');
      }
      
      navigate('/shifts');
    } catch (error) {
      console.error('Error saving shift:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} shift`);
    }
    
    setSubmitting(false);
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
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? 'Edit Shift' : 'Post New Shift'}
        </h1>
        
        <Link
          to="/shifts"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaTimes className="mr-2" />
          Cancel
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <Formik
            initialValues={getInitialValues()}
            validationSchema={shiftSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, touched, errors, values }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="facility_id" className="form-label">Facility</label>
                    {currentFacility ? (
                      <div className="form-input bg-gray-100">
                        {currentFacility.name}
                        <Field 
                          type="hidden" 
                          name="facility_id" 
                          value={currentFacility.id} 
                        />
                      </div>
                    ) : (
                      <Field
                        as="select"
                        id="facility_id"
                        name="facility_id"
                        className={`form-input ${touched.facility_id && errors.facility_id ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Facility</option>
                        {facilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name}
                          </option>
                        ))}
                      </Field>
                    )}
                    <ErrorMessage name="facility_id" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="unit" className="form-label">Unit</label>
                    <Field
                      type="text"
                      id="unit"
                      name="unit"
                      className={`form-input ${touched.unit && errors.unit ? 'border-red-500' : ''}`}
                      placeholder="e.g., ICU, Emergency, Pediatrics"
                    />
                    <ErrorMessage name="unit" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="shift_type" className="form-label">Shift Type</label>
                    <Field
                      as="select"
                      id="shift_type"
                      name="shift_type"
                      className={`form-input ${touched.shift_type && errors.shift_type ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Shift Type</option>
                      <option value="Day">Day</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                      <option value="12-Hour">12-Hour</option>
                    </Field>
                    <ErrorMessage name="shift_type" component="div" className="form-error" />
                  </div>
                  
                  {/* Status field - hidden for new shifts, only shown when editing */}
                  {isEdit ? (
                    <div>
                      <label htmlFor="status" className="form-label">Status</label>
                      <Field
                        as="select"
                        id="status"
                        name="status"
                        className={`form-input ${touched.status && errors.status ? 'border-red-500' : ''}`}
                      >
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Field>
                      <ErrorMessage name="status" component="div" className="form-error" />
                    </div>
                  ) : (
                    // Hidden field for new shifts - always 'open'
                    <Field type="hidden" name="status" value="open" />
                  )}
                  
                  <div>
                    <label htmlFor="start_time" className="form-label">Start Time</label>
                    <Field
                      type="datetime-local"
                      id="start_time"
                      name="start_time"
                      className={`form-input ${touched.start_time && errors.start_time ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="start_time" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="end_time" className="form-label">End Time</label>
                    <Field
                      type="datetime-local"
                      id="end_time"
                      name="end_time"
                      className={`form-input ${touched.end_time && errors.end_time ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="end_time" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="hourly_rate" className="form-label">Hourly Rate ($)</label>
                    <Field
                      type="number"
                      id="hourly_rate"
                      name="hourly_rate"
                      min="0"
                      step="0.01"
                      className={`form-input ${touched.hourly_rate && errors.hourly_rate ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="hourly_rate" component="div" className="form-error" />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Requirements</label>
                  <FieldArray name="requirements">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Field
                              name={`requirements.${index}`}
                              className="form-input flex-grow"
                              placeholder="e.g., BLS Certification, 2+ years experience"
                            />
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="btn btn-danger p-2"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="btn btn-secondary inline-flex items-center"
                        >
                          <FaPlus className="mr-2" />
                          Add Requirement
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <FaSave className="mr-2" />
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update Shift' : 'Post Shift'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ShiftForm;