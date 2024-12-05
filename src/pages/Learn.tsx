import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MultipleChoice from '../components/exercises/MultipleChoice';
import DrawingExercise from '../components/exercises/DrawingExercise';
import ExerciseResults from '../components/ExerciseResults';
import { userProgressService } from '../services/userProgress';
import type { Exercise, LessonLevel } from '../types/cistercian';

const Learn: React.FC = () => {
  const { t } = useTranslation();
  const [currentLesson, setCurrentLesson] = useState<LessonLevel | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userXP, setUserXP] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonLevel[]>([]);

  const generateExercises = (min: number, max: number, count: number, step: number = 1): Exercise[] => {
    const exercises: Exercise[] = [];
    const usedNumbers = new Set<number>();
    let attempts = 0;
    const maxAttempts = 100;

    const getPosition = (num: number): 'units' | 'tens' | 'hundreds' | 'thousands' => {
      if (num < 10) return 'units';
      if (num < 100) return 'tens';
      if (num < 1000) return 'hundreds';
      return 'thousands';
    };

    while (exercises.length < count && attempts < maxAttempts) {
      attempts++;
      const num = Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
      
      if (!usedNumbers.has(num)) {
        usedNumbers.add(num);
        
        const options = new Set<number>([num]);
        while (options.size < 4 && attempts < maxAttempts) {
          attempts++;
          const option = Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
          options.add(option);
        }

        const position = getPosition(num);
        const displayNum = position === 'units' ? num : Math.floor(num / Math.pow(10, ['units', 'tens', 'hundreds', 'thousands'].indexOf(position)));
        
        const exercise: Exercise = Math.random() > 0.5 
          ? {
              type: 'qcm',
              question: 'learn.exercises.whatNumber',
              correctAnswer: num.toString(),
              options: Array.from(options).map(n => n.toString()),
              targetNumber: num
            }
          : {
              type: 'drawing',
              question: 'learn.exercises.drawNumber',
              correctAnswer: num.toString(),
              targetNumber: displayNum,
              position: position,
              translationParams: {
                number: displayNum,
                position: t(`reference.positions.${position}.name`)
              }
            };
        
        exercises.push(exercise);
      }
    }

    return exercises;
  };

  const createLessons = (): LessonLevel[] => [
    {
      id: 'basics-1',
      title: t('learn.lessons.basics1.title'),
      description: t('learn.lessons.basics1.description'),
      requiredLessonId: null,
      minXP: 0,
      xpReward: 100,
      exercises: generateExercises(1, 9, 10, 1)
    },
    {
      id: 'basics-2',
      title: t('learn.lessons.basics2.title'),
      description: t('learn.lessons.basics2.description'),
      requiredLessonId: 'basics-1',
      minXP: 100,
      xpReward: 200,
      exercises: generateExercises(10, 90, 10, 10)
    },
    {
      id: 'basics-3',
      title: t('learn.lessons.basics3.title'),
      description: t('learn.lessons.basics3.description'),
      requiredLessonId: 'basics-2',
      minXP: 250,
      xpReward: 200,
      exercises: generateExercises(11, 99, 10, 1)
    },
    {
      id: 'hundreds',
      title: t('learn.lessons.hundreds.title'),
      description: t('learn.lessons.hundreds.description'),
      requiredLessonId: 'basics-3',
      minXP: 450,
      xpReward: 250,
      exercises: generateExercises(100, 900, 10, 100)
    },
    {
      id: 'thousands',
      title: t('learn.lessons.thousands.title'),
      description: t('learn.lessons.thousands.description'),
      requiredLessonId: 'hundreds',
      minXP: 700,
      xpReward: 300,
      exercises: generateExercises(1000, 9000, 10, 1000)
    },
    {
      id: 'mastery',
      title: t('learn.lessons.mastery.title'),
      description: t('learn.lessons.mastery.description'),
      requiredLessonId: 'thousands',
      minXP: 1000,
      xpReward: 500,
      exercises: generateExercises(1, 9999, 10, 1)
    }
  ];

  useEffect(() => {
    setLessons(createLessons());
  }, [t]);

  const isLessonCompleted = (lesson: LessonLevel) => {
    const lessonIndex = lessons.findIndex(l => l.id === lesson.id);
    const previousLessons = lessons.slice(0, lessonIndex);
    const totalXPRequired = previousLessons.reduce((sum, l) => sum + l.xpReward, 0);
    return userXP >= totalXPRequired + lesson.xpReward;
  };

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      const progress = await userProgressService.getUserProgress();
      setUserXP(progress.xp);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement de la progression:', err);
      setError(t('learn.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProgress();
  }, []);

  const handleExerciseComplete = async (success: boolean) => {
    try {
      if (success && currentLesson) {
        setCorrectAnswers(prev => prev + 1);
        const xpPerExercise = Math.floor(currentLesson.xpReward / currentLesson.exercises.length);
        await userProgressService.updateProgress(xpPerExercise);
        const progress = await userProgressService.getUserProgress();
        setUserXP(progress.xp);
      }

      if (currentLesson && currentExerciseIndex === currentLesson.exercises.length - 1) {
        setShowResults(true);
      } else {
        setCurrentExerciseIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la progression:', err);
      setError(t('learn.errorProgress'));
    }
  };

  const handleLessonSelect = (lesson: LessonLevel) => {
    setCurrentLesson(lesson);
    setCurrentExerciseIndex(0);
    setCorrectAnswers(0);
    setShowResults(false);
    setError(null);
  };

  const handleFinishLesson = () => {
    setCurrentLesson(null);
    setCurrentExerciseIndex(0);
    setCorrectAnswers(0);
    setShowResults(false);
    loadUserProgress();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={loadUserProgress}>
              {t('common.retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!currentLesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('learn.title')}
        </Typography>
        <Typography paragraph>
          {t('learn.introduction')}
        </Typography>
        
        <Box sx={{ display: 'grid', gap: 2, mt: 4 }}>
          {lessons.map((lesson) => (
            <Paper
              key={lesson.id}
              sx={{
                p: 2,
                opacity: lesson.minXP <= userXP ? 1 : 0.5,
                cursor: lesson.minXP <= userXP ? 'pointer' : 'not-allowed'
              }}
              onClick={() => lesson.minXP <= userXP && handleLessonSelect(lesson)}
            >
              <Typography variant="h6">{lesson.title}</Typography>
              <Typography color="textSecondary">{lesson.description}</Typography>
              {isLessonCompleted(lesson) && (
                <Typography color="success.main">
                  {t('learn.progress.levelComplete')}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  if (showResults) {
    return (
      <ExerciseResults
        totalQuestions={currentLesson.exercises.length}
        correctAnswers={correctAnswers}
        errors={currentLesson.exercises.length - correctAnswers}
        xpEarned={Math.round((correctAnswers / currentLesson.exercises.length) * currentLesson.xpReward)}
        onContinue={handleFinishLesson}
      />
    );
  }

  const currentExercise = currentLesson.exercises[currentExerciseIndex];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {currentLesson.title} - {t('learn.progress.exercise', { 
          current: currentExerciseIndex + 1,
          total: currentLesson.exercises.length 
        })}
      </Typography>

      {currentExercise.type === 'qcm' ? (
        <MultipleChoice
          exercise={currentExercise}
          onComplete={handleExerciseComplete}
        />
      ) : (
        <DrawingExercise
          exercise={currentExercise}
          onComplete={handleExerciseComplete}
        />
      )}
    </Box>
  );
};

export default Learn; 