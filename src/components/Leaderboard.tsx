import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

interface LeaderboardEntry {
  userId: string;
  username: string;
  xp: number;
  level: string;
  streakDays: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leaderboard-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const getRankTranslation = (t: any, rank: number) => {
  if (rank <= 3) {
    return t(`leaderboard.ranks.${rank}`);
  }
  return t('leaderboard.ranks.other', { rank });
};

const normalizeLevel = (level: string): string => {
  const normalization: { [key: string]: string } = {
    'Maître': 'maitre',
    'Expert': 'expert',
    'Avancé': 'avance',
    'Intermédiaire': 'intermediaire',
    'Apprenti': 'apprenti',
    'Novice': 'novice',
    'Master': 'maitre',
    'Advanced': 'avance',
    'Intermediate': 'intermediaire',
    'Apprentice': 'apprenti'
  };
  return normalization[level] || level.toLowerCase();
};

const Leaderboard = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [dailyLeaders, setDailyLeaders] = useState<LeaderboardEntry[]>([]);
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error(t('common.error'));
      }

      const response = await fetch('http://localhost:3000/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(t('leaderboard.error'));
      }

      const data = await response.json();
      setAllTimeLeaders(data.allTime);
      setWeeklyLeaders(data.weekly);
      setDailyLeaders(data.daily);
      setError(null);
    } catch (error: any) {
      console.error(t('leaderboard.error'), error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderLeaderboardTable = (leaders: LeaderboardEntry[]) => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('leaderboard.columns.rank')}</TableCell>
            <TableCell>{t('leaderboard.columns.player')}</TableCell>
            <TableCell align="right">{t('leaderboard.columns.xp')}</TableCell>
            <TableCell align="right">{t('leaderboard.columns.level')}</TableCell>
            <TableCell align="right">{t('leaderboard.columns.streak')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaders.map((leader, index) => (
            <TableRow 
              key={leader.userId}
              sx={{ 
                bgcolor: index < 3 ? `rgba(255, 215, 0, ${0.1 * (3 - index)})` : 'inherit'
              }}
            >
              <TableCell>
                {index < 3 ? (
                  <>
                    <EmojiEvents 
                      sx={{ 
                        color: ['gold', 'silver', '#cd7f32'][index],
                        verticalAlign: 'middle',
                        mr: 1
                      }} 
                    />
                    {getRankTranslation(t, index + 1)}
                  </>
                ) : (
                  getRankTranslation(t, index + 1)
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar>{leader.username[0].toUpperCase()}</Avatar>
                  <Typography>{leader.username}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Chip label={`${leader.xp} XP`} color="primary" />
              </TableCell>
              <TableCell align="right">
                {t(`leaderboard.levels.${normalizeLevel(leader.level)}`)}
              </TableCell>
              <TableCell align="right">
                <Chip 
                  label={t('leaderboard.streakDays', { count: leader.streakDays })}
                  color="secondary"
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        {error}
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label={t('leaderboard.tabs.daily')} />
          <Tab label={t('leaderboard.tabs.weekly')} />
          <Tab label={t('leaderboard.tabs.allTime')} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderLeaderboardTable(dailyLeaders)}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderLeaderboardTable(weeklyLeaders)}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {renderLeaderboardTable(allTimeLeaders)}
      </TabPanel>
    </Paper>
  );
};

export default Leaderboard; 