// Shared/Controller/dashboardController.js
import * as dashboardModel from '../Models/dashboard.js';

export const getUserEarnings = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get nurse ID from user ID
    const nurseId = await dashboardModel.getNurseIdByUserId(userId);
    
    // Get earnings data
    const earningsData = await dashboardModel.getEarningsData(nurseId);
    
    res.json(earningsData);
  } catch (error) {
    console.error('Error fetching user earnings:', error);
    
    if (error.message === 'Nurse profile not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUpcomingShift = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get nurse ID from user ID
    const nurseId = await dashboardModel.getNurseIdByUserId(userId);
    
    // Get upcoming shift
    const upcomingShift = await dashboardModel.getNextUpcomingShift(nurseId);
    
    if (!upcomingShift) {
      return res.status(404).json({ error: 'No upcoming shifts found' });
    }
    
    res.json(upcomingShift);
  } catch (error) {
    console.error('Error fetching upcoming shift:', error);
    
    if (error.message === 'Nurse profile not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCompletedShifts = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get nurse ID from user ID
    const nurseId = await dashboardModel.getNurseIdByUserId(userId);
    
    // Get completed shifts
    const completedShifts = await dashboardModel.getRecentCompletedShifts(nurseId, 5);
    
    res.json(completedShifts);
  } catch (error) {
    console.error('Error fetching completed shifts:', error);
    
    if (error.message === 'Nurse profile not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};