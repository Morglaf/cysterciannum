import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Home,
  School,
  MenuBook,
  EmojiEvents,
  Settings,
  Language as LanguageIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Logout,
} from '@mui/icons-material';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../components/auth/AuthProvider';
import MonkIcon from './MonkIcon';
import { eventEmitter, EVENTS } from '../services/events';
import { userProgressService } from '../services/userProgress';

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

const Navigation = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [languageMenu, setLanguageMenu] = useState<null | HTMLElement>(null);
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    const loadUserXP = async () => {
      try {
        const progress = await userProgressService.getUserProgress();
        setUserXP(progress.xp);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'XP:', error);
      }
    };

    loadUserXP();

    const handleXPUpdate = (xp: number) => {
      setUserXP(xp);
    };

    eventEmitter.on(EVENTS.XP_UPDATED, handleXPUpdate);

    return () => {
      eventEmitter.off(EVENTS.XP_UPDATED, handleXPUpdate);
    };
  }, []);

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenu(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageMenu(null);
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    handleLanguageClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <MonkIcon sx={{ fontSize: 32 }} />
        </Box>

        <Chip 
          label={`${userXP} XP`}
          color="secondary"
          sx={{ 
            mr: 2,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            '& .MuiChip-label': {
              fontWeight: 'bold'
            }
          }}
        />

        <Tooltip title={t('menu.home')}>
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <Home />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('menu.learn')}>
          <IconButton color="inherit" onClick={() => navigate('/learn')}>
            <School />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('menu.reference')}>
          <IconButton color="inherit" onClick={() => navigate('/reference')}>
            <MenuBook />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('menu.leaderboard')}>
          <IconButton color="inherit" onClick={() => navigate('/leaderboard')}>
            <EmojiEvents />
          </IconButton>
        </Tooltip>

        <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
          {isDarkMode ? <LightIcon /> : <DarkIcon />}
        </IconButton>

        <IconButton color="inherit" onClick={handleLanguageClick} sx={{ ml: 1 }}>
          <LanguageIcon />
        </IconButton>

        <Tooltip title={t('menu.account')}>
          <IconButton
            color="inherit"
            onClick={() => navigate('/account')}
            sx={{ ml: 1 }}
          >
            <Settings />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('menu.logout')}>
          <IconButton
            color="inherit"
            onClick={logout}
            sx={{ ml: 1 }}
          >
            <Logout />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={languageMenu}
          open={Boolean(languageMenu)}
          onClose={handleLanguageClose}
        >
          {languages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              selected={i18n.language === lang.code}
            >
              {lang.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 