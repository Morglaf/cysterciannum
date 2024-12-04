import { EmojiEvents, School, Timer, Whatshot, Psychology, Grade } from '@mui/icons-material';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any; // Type MUI Icon
  condition: (progress: any) => boolean;
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    title: 'Premier Pas',
    description: 'Complétez votre première leçon',
    icon: School,
    condition: (progress) => progress.completedLessons.length >= 1,
    xpReward: 50
  },
  {
    id: 'streak_3',
    title: 'Persévérant',
    description: '3 jours consécutifs d\'apprentissage',
    icon: Whatshot,
    condition: (progress) => progress.streakDays >= 3,
    xpReward: 100
  },
  {
    id: 'master_basics',
    title: 'Maître des Bases',
    description: 'Complétez toutes les leçons de base',
    icon: Grade,
    condition: (progress) => 
      ['basics-1', 'basics-2', 'basics-3'].every(id => 
        progress.completedLessons.includes(id)
      ),
    xpReward: 200
  },
  {
    id: 'speed_learner',
    title: 'Apprenti Rapide',
    description: 'Complétez 5 exercices sans erreur',
    icon: Timer,
    condition: (progress) => progress.perfectExercises >= 5,
    xpReward: 150
  },
  {
    id: 'number_master',
    title: 'Maître des Nombres',
    description: 'Atteignez 1000 XP',
    icon: EmojiEvents,
    condition: (progress) => progress.xp >= 1000,
    xpReward: 300
  },
  {
    id: 'expert_cistercian',
    title: 'Expert Cistercien',
    description: 'Complétez toutes les leçons avancées',
    icon: Psychology,
    condition: (progress) => 
      ['double-digits', 'triple-digits', 'full-numbers', 'mastery'].every(id => 
        progress.completedLessons.includes(id)
      ),
    xpReward: 500
  }
];

export const checkAchievements = (progress: any) => {
  return ACHIEVEMENTS.filter(achievement => 
    !progress.achievements.includes(achievement.id) && 
    achievement.condition(progress)
  );
}; 