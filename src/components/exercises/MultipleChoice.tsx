import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Grid,
  Paper,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CistercianDisplay from '../CistercianDisplay';
import type { Exercise } from '../../types/cistercian';

interface MultipleChoiceProps {
  exercise: Exercise;
  onComplete: (success: boolean) => void;
}

const MultipleChoice = ({ exercise, onComplete }: MultipleChoiceProps) => {
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const isCorrect = selectedAnswer === exercise.correctAnswer;

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    setTimeout(() => {
      onComplete(answer === exercise.correctAnswer);
      setShowResult(false);
      setSelectedAnswer(null);
    }, 1500);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t(exercise.question)}
      </Typography>

      <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <CistercianDisplay 
          number={exercise.targetNumber} 
          size={150}
          showGrid
        />
      </Box>

      <Grid container spacing={2}>
        {exercise.options?.map((option) => (
          <Grid item xs={6} key={option}>
            <Button
              fullWidth
              variant={selectedAnswer === option ? 'contained' : 'outlined'}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              sx={{ 
                height: 60,
                backgroundColor: showResult 
                  ? (option === exercise.correctAnswer 
                    ? 'success.light'
                    : option === selectedAnswer 
                      ? 'error.light'
                      : undefined)
                  : undefined
              }}
            >
              {option}
            </Button>
          </Grid>
        ))}
      </Grid>

      {showResult && (
        <Alert 
          severity={isCorrect ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          {isCorrect 
            ? t('learn.correct')
            : t('learn.incorrect')}
        </Alert>
      )}

      {exercise.hints && showResult && !isCorrect && (
        <Paper sx={{ mt: 2, p: 2, bgcolor: 'info.light' }}>
          <Typography variant="body2">
            {t('learn.feedback.hint')}: {exercise.hints[0]}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MultipleChoice; 