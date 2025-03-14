// Shared/Models/dashboard.js
import { pool } from '../../src/app.js';

export const getNurseIdByUserId = async (userId) => {
  const userResult = await pool.query(
    `SELECT np.id FROM nurse_profiles np WHERE np.user_id = $1`,
    [userId]
  );
  
  if (!userResult.rows || userResult.rows.length === 0) {
    throw new Error('Nurse profile not found');
  }
  
  return userResult.rows[0].id;
};

export const getEarningsData = async (nurseId) => {
  // Calculate earnings from completed shifts
  const earningsQuery = `
    SELECT 
      SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600 * s.hourly_rate) as total_earnings,
      SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) as total_hours,
      COUNT(*) as completed_shifts
    FROM shifts s
    JOIN applications a ON s.id = a.shift_id
    WHERE a.nurse_id = $1
    AND s.status = 'completed'
  `;
  
  // Calculate weekly earnings
  const weeklyEarningsQuery = `
    SELECT 
      SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600 * s.hourly_rate) as weekly_earnings
    FROM shifts s
    JOIN applications a ON s.id = a.shift_id
    WHERE a.nurse_id = $1
    AND s.status = 'completed'
    AND s.end_time > NOW() - INTERVAL '7 days'
  `;
  
  // Calculate monthly earnings
  const monthlyEarningsQuery = `
    SELECT 
      SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600 * s.hourly_rate) as monthly_earnings
    FROM shifts s
    JOIN applications a ON s.id = a.shift_id
    WHERE a.nurse_id = $1
    AND s.status = 'completed'
    AND s.end_time > NOW() - INTERVAL '30 days'
  `;
  
  const [earningsResult, weeklyResult, monthlyResult] = await Promise.all([
    pool.query(earningsQuery, [nurseId]),
    pool.query(weeklyEarningsQuery, [nurseId]),
    pool.query(monthlyEarningsQuery, [nurseId])
  ]);
  
  const earnings = earningsResult.rows[0];
  
  return {
    weekly: parseFloat(weeklyResult.rows[0].weekly_earnings || 0),
    monthly: parseFloat(monthlyResult.rows[0].monthly_earnings || 0),
    totalHours: parseFloat(earnings.total_hours || 0),
    completedShifts: parseInt(earnings.completed_shifts || 0)
  };
};

export const getNextUpcomingShift = async (nurseId) => {
  const shiftQuery = `
    SELECT 
      s.id,
      f.name as hospital,
      s.unit,
      s.start_time,
      s.end_time,
      s.hourly_rate
    FROM shifts s
    JOIN applications a ON s.id = a.shift_id
    JOIN facilities f ON s.facility_id = f.id
    WHERE a.nurse_id = $1
    AND s.status = 'assigned'
    AND s.start_time > NOW()
    ORDER BY s.start_time ASC
    LIMIT 1
  `;
  
  const shiftResult = await pool.query(shiftQuery, [nurseId]);
  
  if (!shiftResult.rows || shiftResult.rows.length === 0) {
    return null;
  }
  
  const shift = shiftResult.rows[0];
  const startTime = new Date(shift.start_time);
  const endTime = new Date(shift.end_time);
  const hours = Math.round((endTime - startTime) / 3600000);
  
  // Calculate the date display (Tomorrow, Today, or the actual date)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let dateDisplay;
  if (startTime.toDateString() === today.toDateString()) {
    dateDisplay = 'Today';
  } else if (startTime.toDateString() === tomorrow.toDateString()) {
    dateDisplay = 'Tomorrow';
  } else {
    dateDisplay = startTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
  
  return {
    id: shift.id,
    hospital: shift.hospital,
    unit: shift.unit,
    date: dateDisplay,
    time: startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }),
    hours: hours,
    rate: parseFloat(shift.hourly_rate)
  };
};

export const getRecentCompletedShifts = async (nurseId, limit = 5) => {
  const shiftsQuery = `
    SELECT 
      s.id,
      f.name as hospital,
      s.unit,
      s.start_time,
      s.end_time,
      s.hourly_rate
    FROM shifts s
    JOIN applications a ON s.id = a.shift_id
    JOIN facilities f ON s.facility_id = f.id
    WHERE a.nurse_id = $1
    AND s.status = 'completed'
    ORDER BY s.end_time DESC
    LIMIT $2
  `;
  
  const shiftsResult = await pool.query(shiftsQuery, [nurseId, limit]);
  
  return shiftsResult.rows.map(shift => {
    const startTime = new Date(shift.start_time);
    const endTime = new Date(shift.end_time);
    const hours = Math.round((endTime - startTime) / 3600000);
    const earnings = hours * parseFloat(shift.hourly_rate);
    
    return {
      id: shift.id,
      hospital: shift.hospital,
      unit: shift.unit,
      date: startTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      hours: hours,
      earnings: earnings,
      status: 'completed'
    };
  });
};