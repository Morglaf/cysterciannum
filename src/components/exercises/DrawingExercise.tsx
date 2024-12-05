import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../../types/cistercian';
import { generateDigit } from '../../utils/cistercianGenerator';
import { soundManager } from '../../services/sounds';

interface Point {
  x: number;
  y: number;
}

interface DrawingExerciseProps {
  exercise: Exercise;
  onComplete: (success: boolean) => void;
}

const extractPoints = (path: string): { start: Point; end: Point } => {
  const parts = path.split(' ');
  return {
    start: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
    end: { x: parseFloat(parts[4]), y: parseFloat(parts[5]) }
  };
};

const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const arePointsEqual = (p1: Point, p2: Point): boolean => {
  return Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1;
};

const validateDrawing = (userPaths: string[], correctPaths: string[]): boolean => {
  // Filtrer les traits incomplets (trop courts)
  const validUserPaths = userPaths.filter(path => {
    const points = extractPoints(path);
    return calculateDistance(points.start, points.end) > 5; // Ignorer les traits trop courts
  });

  if (validUserPaths.length === 0) return false;

  const userSegments = validUserPaths.map(path => extractPoints(path));
  const correctSegments = correctPaths.map(path => extractPoints(path));

  // Vérifie que chaque segment correct a une correspondance exacte
  const matchedSegments = correctSegments.filter(correctSeg => 
    userSegments.some(userSeg => 
      // Le segment doit correspondre exactement dans un sens ou dans l'autre
      (arePointsEqual(userSeg.start, correctSeg.start) && arePointsEqual(userSeg.end, correctSeg.end)) ||
      (arePointsEqual(userSeg.start, correctSeg.end) && arePointsEqual(userSeg.end, correctSeg.start))
    )
  );

  // Vérifie que l'utilisateur n'a pas dessiné trop de traits
  if (validUserPaths.length > correctPaths.length) {
    return false;
  }

  // Tous les segments doivent correspondre exactement
  return matchedSegments.length === correctSegments.length;
};

const DrawingExercise = ({ exercise, onComplete }: DrawingExerciseProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const centralLine = 'M 50 0 L 50 100';

  // Points de snap possibles (intersections de la grille)
  const snapPoints: Point[] = [
    { x: 50, y: 0 },   // Haut centre
    { x: 50, y: 25 },  // Quart supérieur centre
    { x: 75, y: 0 },   // Haut droite
    { x: 75, y: 25 },  // Quart supérieur droite
    { x: 25, y: 0 },   // Haut gauche
    { x: 25, y: 25 },  // Quart supérieur gauche
    { x: 50, y: 75 },  // Quart inférieur centre
    { x: 50, y: 100 }, // Bas centre
    { x: 75, y: 75 },  // Quart inférieur droite
    { x: 75, y: 100 }, // Bas droite
    { x: 25, y: 75 },  // Quart inférieur gauche
    { x: 25, y: 100 }  // Bas gauche
  ];

  const findNearestSnapPoint = (point: Point): Point => {
    let nearest = snapPoints[0];
    let minDistance = calculateDistance(point, nearest);

    for (const snapPoint of snapPoints) {
      const distance = calculateDistance(point, snapPoint);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = snapPoint;
      }
    }

    // Ne retourne le point de snap que si on est assez proche
    return minDistance <= 15 ? nearest : point;
  };

  useEffect(() => {
    setPaths([]);
    setCurrentPath('');
    setShowCorrectAnswer(false);
    setIsCorrect(null);
    setIsCompleted(false);
  }, [exercise.targetNumber]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!svgRef.current || isCompleted) return;
    
    const point = getMousePosition(e);
    const snappedPoint = findNearestSnapPoint(point);
    setIsDrawing(true);
    setCurrentPath(`M ${snappedPoint.x} ${snappedPoint.y}`);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !svgRef.current || isCompleted || !currentPath) return;
    
    const point = getMousePosition(e);
    const snappedPoint = findNearestSnapPoint(point);
    
    // Ne met à jour le chemin que si on est sur un point de snap
    if (calculateDistance(point, snappedPoint) <= 15) {
      const [, startX, startY] = currentPath.split(' ');
      setCurrentPath(`M ${startX} ${startY} L ${snappedPoint.x} ${snappedPoint.y}`);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath && currentPath.includes('L')) {
      setPaths(prev => [...prev, currentPath]);
    }
    setCurrentPath('');
    setIsDrawing(false);
  };

  const getMousePosition = (e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (100 / rect.width);
    const y = (e.clientY - rect.top) * (100 / rect.height);
    return { x, y };
  };

  const handleSubmit = () => {
    if (isCompleted) {
      setPaths([]);
      setShowCorrectAnswer(false);
      setIsCorrect(null);
      setIsCompleted(false);
      return;
    }

    const correctPaths = generateDigit(exercise.targetNumber, exercise.position || 'units');
    // Retirer le trait central des chemins corrects car il est déjà présent
    const correctPathsWithoutCenter = correctPaths.filter(path => path !== centralLine);
    const result = validateDrawing(paths, correctPathsWithoutCenter);
    setIsCorrect(result);
    
    if (result) {
      soundManager.playSound('correct');
      onComplete(true);
    } else {
      soundManager.playSound('incorrect');
      setShowCorrectAnswer(true);
      setIsCompleted(false);
    }
  };

  const handleClear = () => {
    if (!isCompleted) {
      setPaths([]);
      setShowCorrectAnswer(false);
      setIsCorrect(null);
    }
  };

  const getTouchPosition = (touch: React.Touch): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) * 100) / rect.width;
    const y = ((touch.clientY - rect.top) * 100) / rect.height;
    return { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || isCompleted) return;
    e.preventDefault(); // Empêcher le scroll
    
    const touch = e.touches[0];
    const point = getTouchPosition(touch);
    const snappedPoint = findNearestSnapPoint(point);
    setIsDrawing(true);
    setCurrentPath(`M ${snappedPoint.x} ${snappedPoint.y}`);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDrawing || !svgRef.current || isCompleted || !currentPath) return;
    e.preventDefault(); // Empêcher le scroll
    
    const touch = e.touches[0];
    const point = getTouchPosition(touch);
    const snappedPoint = findNearestSnapPoint(point);
    
    if (calculateDistance(point, snappedPoint) <= 15) {
      const [, startX, startY] = currentPath.split(' ');
      setCurrentPath(`M ${startX} ${startY} L ${snappedPoint.x} ${snappedPoint.y}`);
    }
  };

  const handleTouchEnd = () => {
    if (isDrawing && currentPath && currentPath.includes('L')) {
      setPaths(prev => [...prev, currentPath]);
    }
    setCurrentPath('');
    setIsDrawing(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t(exercise.question, exercise.translationParams)}
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mt: 2, 
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
          touchAction: 'none' // Empêcher le zoom et le scroll sur mobile
        }}
      >
        <Box
          ref={svgRef}
          component="svg"
          width={200}
          height={250}
          viewBox="0 0 100 100"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          sx={{
            cursor: isCompleted ? 'default' : 'crosshair',
            touchAction: 'none', // Empêcher le zoom et le scroll sur mobile
            '& path.grid': {
              stroke: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
              strokeWidth: 0.5,
              strokeDasharray: '2,2'
            },
            '& path.grid-main': {
              stroke: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
              strokeWidth: 1
            },
            '& path.central-line': {
              stroke: theme.palette.mode === 'dark' ? '#fff' : '#000',
              strokeWidth: 2,
              fill: 'none'
            },
            '& path.drawing': {
              stroke: theme.palette.mode === 'dark' ? '#fff' : '#000',
              strokeWidth: 2,
              fill: 'none'
            },
            '& path.correct-answer': {
              stroke: theme.palette.success.main,
              strokeWidth: 2,
              fill: 'none',
              opacity: 0.7
            }
          }}
        >
          {/* Trait central permanent */}
          <path 
            className="central-line" 
            d={centralLine}
          />

          {/* Quadrillage */}
          <path 
            className="grid-main" 
            d="M 25 0 L 25 100 M 75 0 L 75 100 M 0 25 L 100 25 M 0 75 L 100 75"
          />

          {/* Lignes diagonales */}
          <path 
            className="grid" 
            d="M 50 0 L 75 25 M 50 25 L 75 0 M 50 0 L 25 25 M 50 25 L 25 0 M 50 75 L 75 100 M 50 100 L 75 75 M 50 75 L 25 100 M 50 100 L 25 75"
          />

          {/* Dessin de l'utilisateur */}
          {paths.map((path, index) => (
            <path key={`drawing-${index}`} className="drawing" d={path} />
          ))}
          {currentPath && <path className="drawing" d={currentPath} />}

          {/* Afficher la bonne réponse en vert si le dessin est incorrect */}
          {showCorrectAnswer && generateDigit(exercise.targetNumber, exercise.position || 'units')
            .filter(path => path !== centralLine)
            .map((path, i) => (
              <path key={`correct-${i}`} className="correct-answer" d={path} />
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={isCompleted}
        >
          {t('learn.exercises.buttons.clear')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          color={isCorrect === false ? 'error' : 'primary'}
        >
          {isCompleted ? t('learn.exercises.buttons.next') : t('learn.exercises.buttons.validate')}
        </Button>
      </Box>

      {isCorrect === false && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light',
            color: theme.palette.mode === 'dark' ? 'error.contrastText' : 'error.dark'
          }}
        >
          {t('learn.incorrect')}
        </Alert>
      )}
    </Box>
  );
};

export default DrawingExercise; 