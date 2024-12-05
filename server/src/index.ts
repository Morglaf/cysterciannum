import * as express from 'express';
import * as cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';

const app = express.default();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-secret';

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuration CORS avec options spécifiques
app.use(cors.default({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Servir les fichiers statiques
app.use('/sounds', express.static(path.join(__dirname, '../public/sounds')));

// Middleware d'authentification
const auth = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();

    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session || new Date() > session.expiresAt) {
      throw new Error();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { progress: true }
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Veuillez vous authentifier.' });
  }
};

// Route de test
app.get('/test', (req, res) => {
  console.log('Test route called');
  res.json({ message: 'Le serveur fonctionne correctement!' });
});

// Route de connexion
app.post('/auth/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        progress: true
      }
    });

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    console.log('Login successful for user:', email);
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Erreur lors de la connexion' });
  }
});

// Route pour obtenir la progression de l'utilisateur
app.get('/user/progress/:userId', auth, async (req: any, res) => {
  try {
    console.log('Getting progress for user:', req.params.userId);
    
    const progress = await prisma.progress.findUnique({
      where: { userId: req.params.userId }
    });

    if (!progress) {
      // Si pas de progression, en créer une nouvelle
      const newProgress = await prisma.progress.create({
        data: {
          userId: req.params.userId,
          xp: 0,
          level: 'Novice',
          streakDays: 0
        }
      });
      return res.json(newProgress);
    }

    res.json(progress);
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la progression' });
  }
});

// Route pour mettre à jour les XP
app.post('/user/progress/xp', auth, async (req: any, res) => {
  try {
    const { xpGained } = req.body;
    console.log('Updating XP for user:', req.user.id, 'Amount:', xpGained);

    // Récupérer la progression actuelle
    const currentProgress = await prisma.progress.findUnique({
      where: { userId: req.user.id }
    });

    if (!currentProgress) {
      return res.status(404).json({ error: 'Progression non trouvée' });
    }

    // Calculer le nouveau niveau
    const newXP = currentProgress.xp + xpGained;
    const newLevel = calculateLevel(newXP);

    // Mettre à jour la progression
    const progress = await prisma.progress.update({
      where: { userId: req.user.id },
      data: {
        xp: newXP,
        level: newLevel
      }
    });

    console.log('Progress updated:', progress);
    res.json(progress);
  } catch (error) {
    console.error('Error updating XP:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des XP' });
  }
});

// Fonction pour calculer le niveau en fonction des XP
function calculateLevel(xp: number): string {
  if (xp < 100) return 'Novice';
  if (xp < 300) return 'Apprenti';
  if (xp < 600) return 'Adepte';
  if (xp < 1000) return 'Expert';
  return 'Maître';
}

// Route pour mettre à jour la série
app.post('/user/progress/streak', auth, async (req: any, res) => {
  try {
    const progress = await prisma.progress.findUnique({
      where: { userId: req.user.id }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progression non trouvée' });
    }

    const lastLogin = new Date(progress.lastLoginDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = progress.streakDays;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const updatedProgress = await prisma.progress.update({
      where: { userId: req.user.id },
      data: {
        streakDays: newStreak,
        lastLoginDate: today
      }
    });

    res.json(updatedProgress);
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la série' });
  }
});

// Route pour obtenir le classement
app.get('/leaderboard', auth, async (req, res) => {
  try {
    console.log('Fetching leaderboard data');

    // Récupérer tous les utilisateurs avec leur progression
    const users = await prisma.user.findMany({
      include: {
        progress: true
      },
      orderBy: {
        progress: {
          xp: 'desc'
        }
      },
      take: 10
    });

    // Récupérer les utilisateurs de la semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyUsers = await prisma.user.findMany({
      where: {
        progress: {
          lastLoginDate: {
            gte: oneWeekAgo
          }
        }
      },
      include: {
        progress: true
      },
      orderBy: {
        progress: {
          xp: 'desc'
        }
      },
      take: 10
    });

    // Récupérer les utilisateurs du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyUsers = await prisma.user.findMany({
      where: {
        progress: {
          lastLoginDate: {
            gte: today
          }
        }
      },
      include: {
        progress: true
      },
      orderBy: {
        progress: {
          xp: 'desc'
        }
      },
      take: 10
    });

    // Formater les données
    const formatUsers = (users: any[]) => users.map(user => ({
      userId: user.id,
      username: user.username || 'Anonyme',
      xp: user.progress?.xp || 0,
      level: user.progress?.level || 'Novice',
      streakDays: user.progress?.streakDays || 0
    }));

    console.log('Sending leaderboard data');
    res.json({
      allTime: formatUsers(users),
      weekly: formatUsers(weeklyUsers),
      daily: formatUsers(dailyUsers)
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du classement' });
  }
});

// Route pour obtenir le profil utilisateur
app.get('/user/profile', auth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        progress: true,
        achievements: true,
        completedLessons: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir la progression de l'utilisateur
app.get('/user/progress', auth, async (req: any, res) => {
  try {
    const progress = await prisma.progress.findUnique({
      where: { userId: req.user.id }
    });

    if (!progress) {
      // Créer une progression par défaut si elle n'existe pas
      const newProgress = await prisma.progress.create({
        data: {
          userId: req.user.id,
          xp: 0,
          level: 'Novice',
          streakDays: 0
        }
      });
      return res.json(newProgress);
    }

    res.json(progress);
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Route pour réinitialiser la progression
app.post('/user/progress/reset', auth, async (req: any, res) => {
  try {
    const progress = await prisma.progress.update({
      where: { userId: req.user.id },
      data: {
        xp: 0,
        level: 'Novice',
        streakDays: 0,
        lastLoginDate: new Date()
      }
    });

    res.json(progress);
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});