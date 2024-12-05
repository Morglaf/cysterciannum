export const userProgressService = {
  async getUserProgress() {
    const response = await fetch('http://localhost:3000/user/progress', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  async updateProgress(xpGained: number) {
    const response = await fetch('http://localhost:3000/user/progress/xp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ xpGained })
    });
    return response.json();
  }
}; 