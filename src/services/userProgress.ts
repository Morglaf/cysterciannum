const API_URL = 'http://localhost:3000';

interface UserProgress {
  xp: number;
  level: string;
  streakDays: number;
  lastLoginDate: string;
}

export const initializeUserProgress = async (userId?: string) => {
  try {
    const actualUserId = userId || localStorage.getItem('userId');
    console.log('Initializing progress for user:', actualUserId);
    
    if (!actualUserId) {
      throw new Error('ID utilisateur non trouvé');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${API_URL}/user/progress/${actualUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'initialisation de la progression');
    }

    const progress = await response.json();
    console.log('Progress initialized:', progress);
    return progress;
  } catch (error) {
    console.error('Error initializing progress:', error);
    throw error;
  }
};

export const updateUserXP = async (xpGained: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${API_URL}/user/progress/xp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ xpGained })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des XP');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating XP:', error);
    throw error;
  }
};

export const completeLesson = async (lessonId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${API_URL}/user/progress/lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ lessonId })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la complétion de la leçon');
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
};

export const updateStreak = async () => {
  try {
    const response = await fetch(`${API_URL}/user/progress/streak`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la série');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}; 