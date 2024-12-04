import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Divider
} from '@mui/material';
import CistercianDisplay from './CistercianDisplay';
import { getDigitDescription } from '../utils/cistercianGenerator';

interface CistercianExplanationProps {
  number: number;
  showDescription?: boolean;
}

const CistercianExplanation = ({ number, showDescription = true }: CistercianExplanationProps) => {
  const digits = {
    units: number % 10,
    tens: Math.floor((number % 100) / 10),
    hundreds: Math.floor((number % 1000) / 100),
    thousands: Math.floor(number / 1000)
  };

  const positions = {
    units: 'en bas à droite',
    tens: 'en bas à gauche',
    hundreds: 'en haut à droite',
    thousands: 'en haut à gauche'
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <CistercianDisplay 
            number={number} 
            size={200}
            showGrid
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Décomposition du nombre {number}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            {Object.entries(digits).map(([position, value]) => {
              if (value === 0) return null;
              return (
                <Box key={position} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    {value} {positions[position as keyof typeof positions]}
                  </Typography>
                  {showDescription && (
                    <Typography variant="body2" color="text.secondary">
                      {getDigitDescription(value)}
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CistercianExplanation; 