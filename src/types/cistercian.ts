export type CistercianDigit = {
  value: number;
  paths: string[];  // SVG paths pour dessiner le chiffre
  description: string;
};

export type LessonLevel = {
  id: string;
  title: string;
  description: string;
  requiredLessonId: string | null;
  minXP: number;
  exercises: Exercise[];
  xpReward: number;
  completed?: boolean;
};

export type Exercise = {
  type: 'qcm' | 'drawing';
  question: string;
  correctAnswer: string;
  options?: string[];  // Pour les QCM
  hints?: string[];
  targetNumber: number;
  position?: 'units' | 'tens' | 'hundreds' | 'thousands';  // Position pour les exercices de dessin
  translationParams?: {
    number: number;
    position?: string;
  };
};

export interface ExerciseResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  errors: number;
  xpEarned: number;
  onContinue: () => void;
} 