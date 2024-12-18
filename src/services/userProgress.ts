import { emitXPUpdate } from './events';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const userProgressService = {
  async getUserProgress() {
    const response = await fetch(`${API_URL}/user/progress`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user progress');
    }
    const data = await response.json();
    emitXPUpdate(data.xp);
    return data;
  },

  async updateProgress(xpGained: number) {
    const response = await fetch(`${API_URL}/user/progress/xp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ xpGained })
    });
    if (!response.ok) {
      throw new Error('Failed to update progress');
    }
    const data = await response.json();
    emitXPUpdate(data.xp);
    return data;
  },

  async getLeaderboard() {
    const response = await fetch(`${API_URL}/leaderboard`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    return response.json();
  }
}; 