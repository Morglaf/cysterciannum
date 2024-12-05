import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-secret';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://morglaf.github.io',
  'https://morglaf.github.io/cysterciannum',
  'https://cysterciannum.onrender.com'
];

// Configuration CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Middleware d'authentification
const auth = async (req, res, next) => {
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

// Routes d'authentification
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        progress: {
          create: {
            xp: 0,
            level: 'Novice',
            streakDays: 0
          }
        }
      },
      include: {
        progress: true
      }
    });

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

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        progress: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
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

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

app.get('/auth/validate', auth, (req, res) => {
  res.json({
    userId: req.user.id,
    email: req.user.email
  });
});

// Routes de progression
app.get('/user/progress', auth, async (req, res) => {
  try {
    const progress = await prisma.progress.findUnique({
      where: { userId: req.user.id }
    });

    if (!progress) {
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
    console.error('Progress error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la progression' });
  }
});

app.post('/user/progress/xp', auth, async (req, res) => {
  try {
    const { xpGained } = req.body;
    const currentProgress = await prisma.progress.findUnique({
      where: { userId: req.user.id }
    });

    if (!currentProgress) {
      return res.status(404).json({ error: 'Progression non trouvée' });
    }

    const newXP = currentProgress.xp + xpGained;
    const newLevel = calculateLevel(newXP);

    const progress = await prisma.progress.update({
      where: { userId: req.user.id },
      data: {
        xp: newXP,
        level: newLevel
      }
    });

    res.json(progress);
  } catch (error) {
    console.error('XP update error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'XP' });
  }
});

// Fonction pour calculer le niveau
function calculateLevel(xp) {
  if (xp < 100) return 'Novice';
  if (xp < 300) return 'Apprenti';
  if (xp < 600) return 'Adepte';
  if (xp < 1000) return 'Expert';
  return 'Maître';
}

// Route du leaderboard
app.get('/leaderboard', auth, async (req, res) => {
  try {
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

    const formatUsers = (users) => users.map(user => ({
      userId: user.id,
      username: user.username || 'Anonyme',
      xp: user.progress?.xp || 0,
      level: user.progress?.level || 'Novice',
      streakDays: user.progress?.streakDays || 0
    }));

    res.json({
      allTime: formatUsers(users),
      weekly: formatUsers(weeklyUsers),
      daily: formatUsers(dailyUsers)
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du classement' });
  }
});

// Servir les fichiers statiques
app.use(express.static('.'));

// Gérer toutes les routes pour l'application React
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 