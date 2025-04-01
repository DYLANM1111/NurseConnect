import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FacilityProfile from './pages/FacilityProfile';
import ShiftList from './pages/ShiftList';
import ShiftDetail from './pages/ShiftDetail';
import ShiftForm from './pages/ShiftForm';
import NotFound from './pages/NotFound';

// Private route for facilities
const FacilityRoute = ({ children }) => {
  const { currentFacility, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!currentFacility) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route path="/" element={
        <FacilityRoute>
          <Layout />
        </FacilityRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="facility-profile" element={<FacilityProfile />} />
        <Route path="shifts" element={<ShiftList />} />
        {/* More specific routes first */}
        <Route path="shifts/new" element={<ShiftForm />} />
        <Route path="shifts/edit/:id" element={<ShiftForm isEdit />} />
        {/* General parameter route last */}
        <Route path="shifts/:id" element={<ShiftDetail />} />
        <Route path="post-shift" element={<ShiftForm />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;