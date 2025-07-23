import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  EmojiEvents,
  LocalFireDepartment,
  Timer,
  Group,
  TrendingUp,
  PlayArrow,
  Leaderboard as LeaderboardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore, selectCurrentPlayer, selectActiveChallenge, selectLeaderboard } from '../game/stores/gameStore';
import { mockPlayer, mockChallenges, mockLeaderboard } from '../game/services/mockData';

const MotionPaper = motion(Paper);

export const GameHub: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentPlayer = useGameStore(selectCurrentPlayer);
  const activeChallenge = useGameStore(selectActiveChallenge);
  const leaderboard = useGameStore(selectLeaderboard);
  const setCurrentPlayer = useGameStore(state => state.setCurrentPlayer);
  const updateLeaderboard = useGameStore(state => state.updateLeaderboard);

  // Initialize with mock data for demo
  useEffect(() => {
    if (!currentPlayer) {
      setCurrentPlayer(mockPlayer);
    }
    if (leaderboard.length === 0) {
      updateLeaderboard(mockLeaderboard);
    }
  }, [currentPlayer, leaderboard.length, setCurrentPlayer, updateLeaderboard]);

  const handleStartChallenge = (challengeId: string) => {
    // Navigate to pattern studio with challenge
    navigate(`/pattern-studio?challenge=${challengeId}`);
  };

  const xpForNextLevel = (currentPlayer?.level || 0) * 1000 + 1000;
  const xpProgress = ((currentPlayer?.xp || 0) % 1000) / 1000;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header with Player Stats */}
        <Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Pattern Creator Arena
          </Typography>
          
          {currentPlayer && (
            <Paper sx={{ p: 3, background: alpha(theme.palette.primary.main, 0.05) }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Chip
                        label={`Lvl ${currentPlayer.level}`}
                        size="small"
                        color="primary"
                      />
                    }
                  >
                    <Avatar
                      src={currentPlayer.avatar}
                      sx={{ width: 80, height: 80 }}
                    />
                  </Badge>
                </Grid>
                
                <Grid item xs>
                  <Typography variant="h5" gutterBottom>
                    {currentPlayer.displayName}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Level {currentPlayer.level} • {currentPlayer.xp} XP
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={xpProgress * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {currentPlayer.xp % 1000} / {1000} XP to next level
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item>
                  <Stack direction="row" spacing={3}>
                    <Box textAlign="center">
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocalFireDepartment color="error" />
                        <Typography variant="h4">{currentPlayer.currentStreak}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Day Streak
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EmojiEvents color="warning" />
                        <Typography variant="h4">{currentPlayer.totalPoints}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Total Points
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TrendingUp color="success" />
                        <Typography variant="h4">#{currentPlayer.stats.patternsCreated}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Patterns
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>

        {/* Active Challenge Alert */}
        {activeChallenge && (
          <MotionPaper
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              p: 2,
              background: alpha(theme.palette.warning.main, 0.1),
              borderLeft: `4px solid ${theme.palette.warning.main}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Timer color="warning" />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Challenge in Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeChallenge.title}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="warning"
                onClick={() => navigate('/pattern-studio')}
              >
                Continue
              </Button>
            </Stack>
          </MotionPaper>
        )}

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Challenges Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Today's Challenges
              </Typography>
              
              <Grid container spacing={2}>
                {mockChallenges.map((challenge, index) => (
                  <Grid item xs={12} sm={6} key={challenge.id}>
                    <MotionPaper
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      elevation={2}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                              {challenge.title}
                            </Typography>
                            <Chip
                              label={challenge.difficulty}
                              size="small"
                              color={
                                challenge.difficulty === 'easy' ? 'success' :
                                challenge.difficulty === 'medium' ? 'warning' :
                                challenge.difficulty === 'hard' ? 'error' : 'secondary'
                              }
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {challenge.description}
                          </Typography>
                        </Box>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1}>
                            <Chip
                              icon={<EmojiEvents />}
                              label={`${challenge.points} pts`}
                              size="small"
                              variant="outlined"
                            />
                            {challenge.timeLimit && (
                              <Chip
                                icon={<Timer />}
                                label={`${challenge.timeLimit}m`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayArrow />}
                            onClick={() => handleStartChallenge(challenge.id)}
                            disabled={!!activeChallenge}
                          >
                            Start
                          </Button>
                        </Stack>
                      </Stack>
                    </MotionPaper>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button variant="outlined" fullWidth>
                  View All Challenges
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => navigate('/pattern-studio')}
                  >
                    Practice Mode
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Group />}
                  >
                    Join Team Battle
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LeaderboardIcon />}
                    onClick={() => navigate('/leaderboards')}
                  >
                    View Leaderboards
                  </Button>
                </Stack>
              </Paper>

              {/* Mini Leaderboard */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Top Players
                </Typography>
                <Stack spacing={2}>
                  {leaderboard.slice(0, 5).map((entry) => (
                    <Stack
                      key={entry.playerId}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          width: 30,
                          color: entry.rank <= 3 ? theme.palette.warning.main : 'text.secondary',
                        }}
                      >
                        #{entry.rank}
                      </Typography>
                      <Avatar src={entry.avatar} sx={{ width: 32, height: 32 }} />
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {entry.playerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.points.toLocaleString()} pts
                        </Typography>
                      </Box>
                      {entry.change !== 0 && (
                        <Chip
                          label={entry.change > 0 ? `+${entry.change}` : entry.change}
                          size="small"
                          color={entry.change > 0 ? 'success' : 'error'}
                          sx={{ minWidth: 40 }}
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* Recent Achievements */}
              {currentPlayer && currentPlayer.achievements.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Recent Achievements
                  </Typography>
                  <Stack spacing={1}>
                    {currentPlayer.achievements.slice(0, 3).map((achievement) => (
                      <Box key={achievement.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmojiEvents
                            sx={{
                              color:
                                achievement.rarity === 'legendary' ? theme.palette.error.main :
                                achievement.rarity === 'epic' ? theme.palette.secondary.main :
                                achievement.rarity === 'rare' ? theme.palette.primary.main :
                                theme.palette.grey[500],
                            }}
                          />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {achievement.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {achievement.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};