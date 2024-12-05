import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from './auth/AuthProvider';
import { useTheme as useAppTheme } from '../utils/ThemeContext';
import { userProgressService } from '../services/userProgress';

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadXP = async () => {
      try {
        setLoading(true);
        const progress = await userProgressService.getUserProgress();
        setXp(progress.xp);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'XP:', err);
        setError(t('learn.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    loadXP();
    // Rafraîchir l'XP toutes les 30 secondes
    const interval = setInterval(loadXP, 30000);
    return () => clearInterval(interval);
  }, [t]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNextLevelXP = (currentXP: number): number => {
    if (currentXP < 100) return 100;
    if (currentXP < 250) return 250;
    if (currentXP < 450) return 450;
    if (currentXP < 700) return 700;
    if (currentXP < 1000) return 1000;
    return currentXP + 500;
  };

  const getCurrentLevelProgress = (currentXP: number): number => {
    const nextLevelXP = getNextLevelXP(currentXP);
    const prevLevelXP = nextLevelXP === 100 ? 0 : 
                       nextLevelXP === 250 ? 100 :
                       nextLevelXP === 450 ? 250 :
                       nextLevelXP === 700 ? 450 :
                       nextLevelXP === 1000 ? 700 :
                       nextLevelXP - 500;
    
    return ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ 
          flexGrow: 0,
          textDecoration: 'none',
          color: 'inherit',
          mr: 4
        }}>
          CisterciaNum
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/learn"
            sx={{ color: location.pathname === '/learn' ? theme.palette.secondary.main : 'inherit' }}
          >
            {t('menu.learn')}
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/reference"
            sx={{ color: location.pathname === '/reference' ? theme.palette.secondary.main : 'inherit' }}
          >
            {t('menu.reference')}
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/leaderboard"
            sx={{ color: location.pathname === '/leaderboard' ? theme.palette.secondary.main : 'inherit' }}
          >
            {t('menu.leaderboard')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!loading && !error && (
            <Tooltip title={`${xp} XP - ${Math.round(getCurrentLevelProgress(xp))}% jusqu'au prochain niveau`}>
              <Box sx={{ width: 100, mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={getCurrentLevelProgress(xp)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 300 : 800],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.secondary.main,
                    },
                  }}
                />
              </Box>
            </Tooltip>
          )}

          <IconButton onClick={toggleTheme} color="inherit">
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <Button
            color="inherit"
            component={Link}
            to="/account"
            sx={{ color: location.pathname === '/account' ? theme.palette.secondary.main : 'inherit' }}
          >
            {t('menu.account')}
          </Button>

          <Button color="inherit" onClick={handleLogout}>
            {t('menu.logout')}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 