// Fonction de validation du dessin
const validateDrawing = (userPaths: string[], correctPaths: string[]): boolean => {
  if (userPaths.length !== correctPaths.length) {
    return false;
  }

  // Tolérance pour la comparaison des coordonnées
  const TOLERANCE = 5;

  // Convertir les chemins en points
  const userPoints = userPaths.map(path => extractPoints(path));
  const correctPoints = correctPaths.map(path => extractPoints(path));

  // Vérifier chaque segment
  for (let i = 0; i < userPoints.length; i++) {
    const userSegment = userPoints[i];
    let foundMatch = false;

    for (let j = 0; j < correctPoints.length; j++) {
      const correctSegment = correctPoints[j];
      if (
        arePointsClose(userSegment.start, correctSegment.start, TOLERANCE) &&
        arePointsClose(userSegment.end, correctSegment.end, TOLERANCE)
      ) {
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      return false;
    }
  }

  return true;
};

// Extraire les points de début et de fin d'un chemin SVG
const extractPoints = (path: string) => {
  const parts = path.split(' ');
  return {
    start: {
      x: parseFloat(parts[1]),
      y: parseFloat(parts[2])
    },
    end: {
      x: parseFloat(parts[4]),
      y: parseFloat(parts[5])
    }
  };
};

// Vérifier si deux points sont proches
const arePointsClose = (p1: Point, p2: Point, tolerance: number): boolean => {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return dx <= tolerance && dy <= tolerance;
}; 