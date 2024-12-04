import { Box, Paper, useTheme } from '@mui/material';
import { generateCistercianNumber, generateDigit } from '../utils/cistercianGenerator';

interface CistercianDisplayProps {
  number: number;
  size?: number;
  color?: string;
  showGrid?: boolean;
}

const CistercianDisplay = ({ 
  number, 
  size = 100, 
  color = 'currentColor',
  showGrid = false 
}: CistercianDisplayProps) => {
  const theme = useTheme();
  const paths = generateCistercianNumber(number);

  // Générer les guides pour tous les chiffres possibles
  const generateGuides = () => {
    const guides: string[] = [];
    const positions: ('units' | 'tens' | 'hundreds' | 'thousands')[] = ['units', 'tens', 'hundreds', 'thousands'];
    
    positions.forEach(position => {
      // Pour chaque position, montrer les 9 chiffres possibles
      for (let digit = 1; digit <= 9; digit++) {
        const digitPaths = generateDigit(digit, position);
        guides.push(...digitPaths);
      }
    });
    
    return guides;
  };

  // Générer le quadrillage
  const gridLines = [];
  if (showGrid) {
    // Lignes verticales
    for (let x = 0; x <= 100; x += 25) {
      gridLines.push(`M ${x} 0 L ${x} 100`);
    }
    // Lignes horizontales
    for (let y = 0; y <= 100; y += 25) {
      gridLines.push(`M 0 ${y} L 100 ${y}`);
    }
    // Lignes diagonales pour le quadrant supérieur droit
    gridLines.push(
      'M 50 0 L 75 25',  // Diagonale du haut vers le bas
      'M 50 25 L 75 0'   // Diagonale du bas vers le haut
    );
    // Lignes diagonales pour le quadrant supérieur gauche
    gridLines.push(
      'M 50 0 L 25 25',
      'M 50 25 L 25 0'
    );
    // Lignes diagonales pour le quadrant inférieur droit
    gridLines.push(
      'M 50 75 L 75 100',
      'M 50 100 L 75 75'
    );
    // Lignes diagonales pour le quadrant inférieur gauche
    gridLines.push(
      'M 50 75 L 25 100',
      'M 50 100 L 25 75'
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        display: 'inline-block',
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white'
      }}
    >
      <Box 
        component="svg" 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
        sx={{
          '& path.grid': {
            stroke: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            strokeWidth: 0.5,
            strokeDasharray: '2,2'
          },
          '& path.grid-main': {
            stroke: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            strokeWidth: 1
          },
          '& path.guide': {
            stroke: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f0f0f0',
            strokeWidth: 2,
            fill: 'none',
            opacity: 0.5
          },
          '& path.number': {
            stroke: color,
            strokeWidth: 2,
            fill: 'none',
            transition: 'all 0.3s ease'
          }
        }}
      >
        {/* Ligne centrale */}
        <path 
          className="grid-main" 
          d="M 50 0 L 50 100"
        />

        {/* Quadrillage */}
        {showGrid && (
          <>
            {/* Lignes principales */}
            <path 
              className="grid-main" 
              d="M 25 0 L 25 100 M 75 0 L 75 100 M 0 25 L 100 25 M 0 75 L 100 75"
            />
            {/* Lignes secondaires */}
            {gridLines.map((d, i) => (
              <path key={`grid-${i}`} className="grid" d={d} />
            ))}
          </>
        )}

        {/* Guides grisés */}
        {showGrid && generateGuides().map((path, i) => (
          <path key={`guide-${i}`} className="guide" d={path} />
        ))}
        
        {/* Chiffre cistercien */}
        {paths.map((path, index) => (
          <path key={`number-${index}`} className="number" d={path} />
        ))}
      </Box>
    </Paper>
  );
};

export default CistercianDisplay; 