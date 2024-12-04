import { Typography, Button, Box, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      key: "progressiveLearning",
      icon: "🎯"
    },
    {
      key: "interactiveExercises",
      icon: "✏️"
    },
    {
      key: "progressTracking",
      icon: "📈"
    }
  ];

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        {t('home.title')}
      </Typography>
      
      <Typography variant="h5" color="textSecondary" paragraph>
        {t('home.subtitle')}
      </Typography>

      <Button 
        variant="contained" 
        size="large" 
        onClick={() => navigate('/learn')}
        sx={{ mt: 4, mb: 6 }}
      >
        {t('home.startLearning')}
      </Button>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {features.map((feature) => (
          <Grid item xs={12} md={4} key={feature.key}>
            <Card>
              <CardContent>
                <Typography variant="h1" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                  {t(`home.features.${feature.key}.title`)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {t(`home.features.${feature.key}.description`)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home; 