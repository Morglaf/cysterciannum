import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MultipleChoice from '../components/exercises/MultipleChoice';
import DrawingExercise from '../components/exercises/DrawingExercise';
import ExerciseResults from '../components/ExerciseResults';
import { userProgressService } from '../services/userProgress';
import type { Exercise } from '../types/cistercian';

const Learn: React.FC = () => {
  const { t } = useTranslation();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseResults, setExerciseResults] = useState<{
    totalQuestions: number;
    correctAnswers: number;
    errors: number;
    xpEarned: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      const progress = await userProgressService.getUserProgress();
      console.log('User progress loaded:', progress);
      // Utiliser la progression pour générer l'exercice approprié
      generateExercise();
    } catch (err) {
      console.error('Erreur lors du chargement de la progression:', err);
      setError(t('learn.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const generateExercise = () => {
    // Logique de génération d'exercice
    const exercise: Exercise = {
      type: Math.random() > 0.5 ? 'qcm' : 'drawing',
      question: 'learn.exercises.identify',
      correctAnswer: '8',
      targetNumber: 8,
      options: ['5', '8', '3', '9'],
      position: 'units',
      translationParams: {
        number: 8,
        position: t('positions.units')
      }
    };
    setCurrentExercise(exercise);
  };

  const handleExerciseComplete = async (success: boolean) => {
    try {
      if (!exerciseResults) {
        setExerciseResults({
          totalQuestions: 1,
          correctAnswers: success ? 1 : 0,
          errors: success ? 0 : 1,
          xpEarned: success ? 10 : 0
        });
      } else {
        setExerciseResults({
          totalQuestions: exerciseResults.totalQuestions + 1,
          correctAnswers: exerciseResults.correctAnswers + (success ? 1 : 0),
          errors: exerciseResults.errors + (success ? 0 : 1),
          xpEarned: exerciseResults.xpEarned + (success ? 10 : 0)
        });
      }

      if (success) {
        console.log('Updating progress with XP:', 10);
        await userProgressService.updateProgress(10);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la progression:', err);
      setError(t('learn.errorProgress'));
    }
  };

  const handleContinue = () => {
    setExerciseResults(null);
    generateExercise();
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

  if (exerciseResults) {
    return (
      <ExerciseResults
        totalQuestions={exerciseResults.totalQuestions}
        correctAnswers={exerciseResults.correctAnswers}
        errors={exerciseResults.errors}
        xpEarned={exerciseResults.xpEarned}
        onContinue={handleContinue}
      />
    );
  }

  if (!currentExercise) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
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