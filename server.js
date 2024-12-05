import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
    // Permettre les requêtes sans origine (comme les appels API directs)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
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

// Stockage temporaire
const users = new Map();
const tokens = new Map();
const userProgress = new Map();

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const userId = tokens.get(token);
  if (!userId) {
    return res.status(401).json({ message: 'Token invalide' });
  }

  const user = Array.from(users.values()).find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ message: 'Utilisateur non trouvé' });
  }

  req.user = user;
  next();
};

// Routes d'authentification
app.post('/auth/register', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    if (users.has(email)) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const userId = Date.now().toString();
    users.set(email, { id: userId, email, password });
    userProgress.set(userId, { xp: 0, completedLessons: [] });

    const token = Math.random().toString(36).substring(2);
    tokens.set(token, userId);

    res.status(201).json({
      token,
      userId,
      email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = users.get(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = Math.random().toString(36).substring(2);
    tokens.set(token, user.id);

    res.json({
      token,
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

app.get('/auth/validate', authenticateToken, (req, res) => {
  res.json({
    userId: req.user.id,
    email: req.user.email
  });
});

// Routes de progression
app.get('/user/progress', authenticateToken, (req, res) => {
  try {
    const progress = userProgress.get(req.user.id) || { xp: 0, completedLessons: [] };
    res.json(progress);
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la progression' });
  }
});

app.post('/user/progress/xp', authenticateToken, (req, res) => {
  try {
    const { xpGained } = req.body;
    const progress = userProgress.get(req.user.id) || { xp: 0, completedLessons: [] };
    progress.xp += xpGained;
    userProgress.set(req.user.id, progress);
    res.json(progress);
  } catch (error) {
    console.error('XP update error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'XP' });
  }
});

app.post('/user/progress/lesson', authenticateToken, (req, res) => {
  try {
    const { lessonId } = req.body;
    const progress = userProgress.get(req.user.id) || { xp: 0, completedLessons: [] };
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    userProgress.set(req.user.id, progress);
    res.json(progress);
  } catch (error) {
    console.error('Lesson completion error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la leçon' });
  }
});

// Route du leaderboard
app.get('/leaderboard', (req, res) => {
  try {
    const leaderboard = Array.from(userProgress.entries())
      .map(([userId, progress]) => {
        const user = Array.from(users.values()).find(u => u.id === userId);
        return {
          userId,
          email: user?.email,
          xp: progress.xp
        };
      })
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du classement' });
  }
});

// Servir les fichiers statiques en développement
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
} else {
  // En production, servir uniquement l'API
  app.get('/', (req, res) => {
    res.json({ message: 'API CystercianNum' });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 