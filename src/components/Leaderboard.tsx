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
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { userProgressService } from '../services/userProgress';

type LeaderboardEntry = {
  userId: string;
  email: string;
  xp: number;
};

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
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
              <TableCell>{t('common.rank')}</TableCell>
              <TableCell>{t('common.player')}</TableCell>
              <TableCell align="right">{t('common.xp')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={entry.userId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{entry.email}</TableCell>
                <TableCell align="right">{entry.xp} XP</TableCell>
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