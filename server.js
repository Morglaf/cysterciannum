import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour vérifier si le dossier dist existe
const checkDist = (req, res, next) => {
  const distPath = join(__dirname, 'dist');
  if (!existsSync(distPath)) {
    console.error('Le dossier dist n\'existe pas. Veuillez exécuter npm run build d\'abord.');
    return res.status(500).send('Configuration error: dist folder not found');
  }
  next();
};

app.use(cors());
app.use(express.json());
app.use(checkDist);
app.use(express.static(join(__dirname, 'dist')));

// Route pour toutes les autres requêtes - nécessaire pour le routage côté client
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (!existsSync(indexPath)) {
    console.error('index.html non trouvé dans le dossier dist');
    return res.status(500).send('Configuration error: index.html not found');
  }
  res.sendFile(indexPath);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Current directory: ${__dirname}`);
  console.log(`Dist path: ${join(__dirname, 'dist')}`);
}); 