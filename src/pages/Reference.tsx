import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CistercianDisplay from '../components/CistercianDisplay';

const Reference = () => {
  const { t } = useTranslation();
  const [customNumber, setCustomNumber] = useState<number>(0);

  const referenceNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => ({
    number,
    description: t(`reference.numbers.${number}.description`)
  }));

  const getPositionText = (value: number, position: string) => {
    if (value > 0) {
      return t(`reference.positions.${position}`, { value });
    }
    return null;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" gutterBottom>
        {t('reference.title')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {referenceNumbers.map(({ number, description }) => (
          <Grid item xs={12} sm={6} md={4} key={number}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <CistercianDisplay number={number} size={80} showGrid />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, mt: { xs: 1, sm: 0 } }}>
                  <Typography variant="h6">
                    {number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        {t('reference.generator.title')}
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label={t('reference.generator.input')}
              type="number"
              value={customNumber}
              onChange={(e) => {
                const value = Math.max(0, Math.min(9999, Number(e.target.value)));
                setCustomNumber(value);
              }}
              inputProps={{ min: 0, max: 9999 }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <CistercianDisplay number={customNumber} size={120} showGrid />
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, mt: { xs: 1, sm: 0 } }}>
                <Typography variant="h6">
                  {t('reference.generator.number')}: {customNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {customNumber > 0 && (
                    <>
                      {getPositionText(customNumber % 10, 'units')}
                      {getPositionText(Math.floor((customNumber % 100) / 10), 'tens') && <br />}
                      {getPositionText(Math.floor((customNumber % 100) / 10), 'tens')}
                      {getPositionText(Math.floor((customNumber % 1000) / 100), 'hundreds') && <br />}
                      {getPositionText(Math.floor((customNumber % 1000) / 100), 'hundreds')}
                      {getPositionText(Math.floor(customNumber / 1000), 'thousands') && <br />}
                      {getPositionText(Math.floor(customNumber / 1000), 'thousands')}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        {t('reference.rules.title')}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          {t('reference.rules.introduction')}
        </Typography>
        <Typography variant="body1" component="div">
          {t('reference.rules.step1')}
          <br />
          {t('reference.rules.step2')}
          <ul>
            <li>{t('reference.rules.positions.tens')}</li>
            <li>{t('reference.rules.positions.units')}</li>
            <li>{t('reference.rules.positions.thousands')}</li>
            <li>{t('reference.rules.positions.hundreds')}</li>
          </ul>
          {t('reference.rules.step3')}
          <br />
          {t('reference.rules.step4')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Reference; 