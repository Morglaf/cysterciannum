import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  useTheme
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Looks3 as ThirdIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { userProgressService } from '../services/userProgress';

type LeaderboardEntry = {
  userId: string;
  email: string;
  xp: number;
};

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await userProgressService.getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Erreur lors de la récupération du classement', err);
        setError(t('leaderboard.error'));
      }
    };

    fetchLeaderboard();
  }, [t]);

  const getRankDisplay = (index: number) => {
    switch (index) {
      case 0:
        return (
          <TrophyIcon sx={{ color: theme.palette.warning.light }} /> // Or
        );
      case 1:
        return (
          <TrophyIcon sx={{ color: theme.palette.grey[400] }} /> // Argent
        );
      case 2:
        return (
          <TrophyIcon sx={{ color: '#CD7F32' }} /> // Bronze
        );
      default:
        return index + 1;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 800 }, mx: 'auto', p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" gutterBottom align="center">
        {t('leaderboard.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '80px' }}>{t('common.rank')}</TableCell>
              <TableCell>{t('common.player')}</TableCell>
              <TableCell align="right" sx={{ width: '100px' }}>{t('common.xp')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow 
                key={entry.userId}
                sx={{
                  bgcolor: index < 3 ? `${theme.palette.action.selected} !important` : 'inherit'
                }}
              >
                <TableCell sx={{ 
                  fontSize: index < 3 ? 'larger' : 'inherit',
                  fontWeight: index < 3 ? 'bold' : 'normal'
                }}>
                  {getRankDisplay(index)}
                </TableCell>
                <TableCell sx={{ 
                  fontSize: index < 3 ? 'larger' : 'inherit',
                  fontWeight: index < 3 ? 'bold' : 'normal'
                }}>
                  {entry.email}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    fontSize: index < 3 ? 'larger' : 'inherit',
                    fontWeight: index < 3 ? 'bold' : 'normal'
                  }}
                >
                  {entry.xp} XP
                </TableCell>
              </TableRow>
            ))}
            {leaderboard.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {t('leaderboard.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Leaderboard; 