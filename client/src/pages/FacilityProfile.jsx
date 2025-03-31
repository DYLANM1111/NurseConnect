import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const FacilityProfile = () => {
  const { currentFacility } = useAuth();
  
  if (!currentFacility) {
    return <div>Loading facility profile...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Facility Profile</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <FaHospital className="text-gray-400 text-3xl mr-4" />
            <h2 className="text-xl font-semibold">{currentFacility.name}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-2" />
                  <span>{currentFacility.contact_email}</span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-gray-400 mr-2" />
                  <span>{currentFacility.contact_phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Contact Person:</span>
                  <p className="mt-1">{currentFacility.contact_name}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mr-2 mt-1" />
                  <div>
                    <p>{currentFacility.address}</p>
                    <p>{currentFacility.city}, {currentFacility.state} {currentFacility.zip_code}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityProfile;