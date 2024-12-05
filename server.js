import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

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

// Routes d'authentification
const users = new Map(); // Stockage temporaire des utilisateurs
const tokens = new Map(); // Stockage temporaire des tokens

app.post('/auth/register', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    if (users.has(email)) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    const userId = Date.now().toString();
    users.set(email, { id: userId, email, password });

    // Créer un token
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

    // Créer un token
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

app.get('/auth/validate', (req, res) => {
  try {
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

    res.json({
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Validate error:', error);
    res.status(500).json({ message: 'Erreur lors de la validation du token' });
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