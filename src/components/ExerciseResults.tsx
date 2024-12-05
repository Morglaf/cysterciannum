import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { ExerciseResultsProps } from '../types/cistercian';

const ResultContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  maxWidth: 600,
  margin: '0 auto',
}));

const ExerciseResults: React.FC<ExerciseResultsProps> = ({
  totalQuestions,
  correctAnswers,
  errors,
  xpEarned,
  onContinue,
}) => {
  const successRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  return (
    <ResultContainer>
      <Typography variant="h4" gutterBottom color="text.primary">
        Résultats de l'exercice
      </Typography>
      
      <Box sx={{ position: 'relative', display: 'inline-flex', my: 3 }}>
        <CircularProgress
          variant="determinate"
          value={successRate}
          size={120}
          thickness={4}
          sx={{
            color: successRate >= 70 ? 'success.main' : 
                  successRate >= 50 ? 'warning.main' : 'error.main'
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography 
            variant="h5" 
            component="div" 
            color="text.primary"
          >
            {successRate}%
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Statistiques détaillées
        </Typography>
        <Typography color="text.primary">
          Questions totales : {totalQuestions}
        </Typography>
        <Typography color="text.primary">
          Réponses correctes : {correctAnswers}
        </Typography>
        <Typography color="text.primary">
          Erreurs : {errors}
        </Typography>
        <Typography 
          color="primary" 
          variant="h6" 
          sx={{ 
            mt: 2,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          +{Math.round(xpEarned)} XP
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 3 }} color="text.primary">
        {successRate >= 70 
          ? "Excellent travail ! Vous maîtrisez bien ce niveau."
          : successRate >= 50
          ? "Bon travail ! Continuez à vous entraîner pour vous améliorer."
          : "Continuez à pratiquer. La persévérance est la clé du succès !"}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={onContinue}
        size="large"
      >
        Continuer
      </Button>
    </ResultContainer>
  );
};

export default ExerciseResults; 