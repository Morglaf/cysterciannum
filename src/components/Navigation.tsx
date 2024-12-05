import React, { useState } from 'react';
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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
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
  const [settingsMenu, setSettingsMenu] = useState<null | HTMLElement>(null);
  const [languageMenu, setLanguageMenu] = useState<null | HTMLElement>(null);
  const [userXP, setUserXP] = useState(0);
  const muiTheme = useMuiTheme();

  React.useEffect(() => {
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

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenu(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsMenu(null);
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenu(event.currentTarget);
    handleSettingsClose();
  };

  const handleLanguageClose = () => {
    setLanguageMenu(null);
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    handleLanguageClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{
        width: '100%',
        top: 0,
        left: 0,
        bgcolor: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/')}
          sx={{ p: 1 }}
        >
          <MonkIcon sx={{ fontSize: 32 }} />
        </IconButton>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          flexGrow: 1,
          justifyContent: 'center'
        }}>
          <Chip 
            label={`${userXP} XP`}
            color="secondary"
            sx={{ 
              mr: 2,
              bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              color: muiTheme.palette.text.primary,
              '& .MuiChip-label': {
                fontWeight: 'bold'
              }
            }}
          />

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
        </Box>

        <Tooltip title={t('menu.settings')}>
          <IconButton
            color="inherit"
            onClick={handleSettingsClick}
            sx={{ ml: 1 }}
          >
            <Settings />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={settingsMenu}
          open={Boolean(settingsMenu)}
          onClose={handleSettingsClose}
        >
          <MenuItem onClick={toggleTheme}>
            <ListItemIcon>
              {isDarkMode ? <LightIcon /> : <DarkIcon />}
            </ListItemIcon>
            <ListItemText primary={t('settings.theme')} />
          </MenuItem>

          <MenuItem onClick={handleLanguageClick}>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary={t('settings.language')} />
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => { navigate('/account'); handleSettingsClose(); }}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary={t('menu.account')} />
          </MenuItem>

          <MenuItem onClick={logout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary={t('menu.logout')} />
          </MenuItem>
        </Menu>

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