// client/src/pages/FacilityForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createFacility, updateFacility, getFacilityById } from '../services/facilityService';

const facilitySchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string()
    .required('State is required')
    .matches(/^[A-Z]{2}$/, 'State must be a 2-letter code (e.g., CA)'),
  zip_code: Yup.string()
    .required('Zip code is required')
    .matches(/^\d{5}(-\d{4})?$/, 'Zip code must be 5 digits or 5+4 format'),
  contact_name: Yup.string(),
  contact_phone: Yup.string()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$/, 'Phone number must be in (123) 456-7890 or 1234567890 format'),
  contact_email: Yup.string().email('Invalid email address')
});

const FacilityForm = ({ isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFacility = async () => {
      if (isEdit && id) {
        try {
          const response = await getFacilityById(id);
          setFacility(response);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching facility:', error);
          setError('Failed to fetch facility details');
          setLoading(false);
        }
      }
    };
    
    fetchFacility();
  }, [id, isEdit]);
  
  const initialValues = {
    name: facility?.name || '',
    address: facility?.address || '',
    city: facility?.city || '',
    state: facility?.state || '',
    zip_code: facility?.zip_code || '',
    contact_name: facility?.contact_name || '',
    contact_phone: facility?.contact_phone || '',
    contact_email: facility?.contact_email || ''
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await updateFacility(id, values);
        toast.success('Facility updated successfully');
      } else {
        await createFacility(values);
        toast.success('Facility created successfully');
      }
      
      navigate('/facilities');
    } catch (error) {
      console.error('Error saving facility:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} facility`);
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
          {isEdit ? 'Edit Facility' : 'Add Facility'}
        </h1>
        
        <Link
          to="/facilities"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaTimes className="mr-2" />
          Cancel
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={facilitySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="form-label">Facility Name</label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${touched.name && errors.name ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="name" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="form-label">Address</label>
                    <Field
                      type="text"
                      id="address"
                      name="address"
                      className={`form-input ${touched.address && errors.address ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="address" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="form-label">City</label>
                    <Field
                      type="text"
                      id="city"
                      name="city"
                      className={`form-input ${touched.city && errors.city ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="city" component="div" className="form-error" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="form-label">State</label>
                      <Field
                        type="text"
                        id="state"
                        name="state"
                        maxLength="2"
                        className={`form-input uppercase ${touched.state && errors.state ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="state" component="div" className="form-error" />
                    </div>
                    
                    <div>
                      <label htmlFor="zip_code" className="form-label">Zip Code</label>
                      <Field
                        type="text"
                        id="zip_code"
                        name="zip_code"
                        className={`form-input ${touched.zip_code && errors.zip_code ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="zip_code" component="div" className="form-error" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="contact_name" className="form-label">Contact Name</label>
                    <Field
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      className={`form-input ${touched.contact_name && errors.contact_name ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="contact_name" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="contact_phone" className="form-label">Contact Phone</label>
                    <Field
                      type="text"
                      id="contact_phone"
                      name="contact_phone"
                      className={`form-input ${touched.contact_phone && errors.contact_phone ? 'border-red-500' : ''}`}
                      placeholder="(123) 456-7890"
                    />
                    <ErrorMessage name="contact_phone" component="div" className="form-error" />
                  </div>
                  
                  <div>
                    <label htmlFor="contact_email" className="form-label">Contact Email</label>
                    <Field
                      type="email"
                      id="contact_email"
                      name="contact_email"
                      className={`form-input ${touched.contact_email && errors.contact_email ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="contact_email" component="div" className="form-error" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <FaSave className="mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Facility'}
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

export default FacilityForm;