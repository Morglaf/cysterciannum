const BASE_SIZE = 100;
const STROKE_WIDTH = 2;

type Point = { x: number; y: number };

const generateBaseLine = (): string => {
  return `M ${BASE_SIZE/2},0 L ${BASE_SIZE/2},${BASE_SIZE}`;
};

const generatePath = (points: Point[]): string => {
  return points.reduce((path, point, index) => {
    return path + `${index === 0 ? 'M' : 'L'} ${point.x},${point.y} `;
  }, '');
};

const generateDigitPaths = (digit: number, position: 'units' | 'tens' | 'hundreds' | 'thousands'): string[] => {
  const paths: string[] = [];
  const center = BASE_SIZE / 2;
  const quarterSize = BASE_SIZE / 4;

  // Configuration selon le quadrant
  const configs = {
    units: { // Haut-droit
      origin: { x: center, y: 0 },
      xDir: 1,
      yDir: 1,
      isTop: true
    },
    tens: { // Haut-gauche
      origin: { x: center, y: 0 },
      xDir: -1,
      yDir: 1,
      isTop: true
    },
    hundreds: { // Bas-gauche
      origin: { x: center, y: BASE_SIZE },
      xDir: -1,
      yDir: -1,
      isTop: false
    },
    thousands: { // Bas-droit
      origin: { x: center, y: BASE_SIZE },
      xDir: 1,
      yDir: -1,
      isTop: false
    }
  };

  const config = configs[position];

  switch(digit) {
    case 1: // Trait horizontal en haut
      paths.push(generatePath([
        config.origin,
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y }
      ]));
      break;

    case 2: // Trait horizontal en bas
      paths.push(generatePath([
        { x: config.origin.x, y: config.origin.y + (quarterSize * config.yDir) },
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
      ]));
      break;

    case 3: // Diagonale
      paths.push(generatePath([
        config.origin,
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
      ]));
      break;

    case 4: // Diagonale avec trait vertical
      paths.push(generatePath([
        { x: config.origin.x, y: config.origin.y + (quarterSize * config.yDir) },
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y }
      ]));
      break;

    case 5: // Superposition du 1 et du 4
      paths.push(
        // Le 1 (trait horizontal en haut)
        generatePath([
          config.origin,
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y }
        ]),
        // Le 4 (diagonale avec trait vertical)
        generatePath([
          { x: config.origin.x, y: config.origin.y + (quarterSize * config.yDir) },
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y }
        ])
      );
      break;

    case 6: // Un seul trait vertical
      paths.push(generatePath([
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y },
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
      ]));
      break;

    case 7: // Angle droit avec trait horizontal
      paths.push(generatePath([
        config.origin,
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y },
        { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
      ]));
      break;

    case 8: // Superposition du 2 (trait horizontal bas) et du 6 (trait vertical)
      paths.push(
        // Le 2 (trait horizontal en bas)
        generatePath([
          { x: config.origin.x, y: config.origin.y + (quarterSize * config.yDir) },
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
        ]),
        // Le 6 (trait vertical)
        generatePath([
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y },
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
        ])
      );
      break;

    case 9:
      // Superposition du 1 (trait horizontal en haut), 2 (trait horizontal en bas) et 6 (trait vertical)
      paths.push(
        // Le 1 (trait horizontal en haut)
        generatePath([
          config.origin,
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y }
        ]),
        // Le 2 (trait horizontal en bas)
        generatePath([
          { x: config.origin.x, y: config.origin.y + (quarterSize * config.yDir) },
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
        ]),
        // Le 6 (trait vertical)
        generatePath([
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y },
          { x: config.origin.x + (quarterSize * config.xDir), y: config.origin.y + (quarterSize * config.yDir) }
        ])
      );
      break;
  }

  return paths;
};

export function generateCistercianNumber(number: number): string[] {
  const paths: string[] = [];
  
  // Ligne verticale centrale
  paths.push('M 50 0 L 50 100');
  
  // Décomposer le nombre en chiffres
  const digits = {
    units: number % 10,
    tens: Math.floor((number % 100) / 10),
    hundreds: Math.floor((number % 1000) / 100),
    thousands: Math.floor(number / 1000)
  };

  // Générer les unités (en haut à droite)
  if (digits.units > 0) {
    paths.push(...generateDigit(digits.units, 'units'));
  }

  // Générer les dizaines (en haut à gauche)
  if (digits.tens > 0) {
    paths.push(...generateDigit(digits.tens, 'tens'));
  }

  // Générer les centaines (en bas à droite)
  if (digits.hundreds > 0) {
    paths.push(...generateDigit(digits.hundreds, 'hundreds'));
  }

  // Générer les milliers (en bas à gauche)
  if (digits.thousands > 0) {
    paths.push(...generateDigit(digits.thousands, 'thousands'));
  }

  return paths;
}

export function generateDigit(digit: number, position: 'units' | 'tens' | 'hundreds' | 'thousands'): string[] {
  const paths: string[] = [];
  const isRight = position === 'units' || position === 'hundreds';
  const isTop = position === 'units' || position === 'tens';
  const baseX = 50;
  const baseY = isTop ? 0 : 100;
  const direction = isRight ? 1 : -1;
  const yDirection = isTop ? 1 : -1;

  switch (digit) {
    case 1:
      // Trait horizontal en haut
      paths.push(`M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`);
      break;
    case 2:
      // Trait horizontal en bas
      paths.push(`M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`);
      break;
    case 3:
      // Diagonale du haut vers le bas
      paths.push(`M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`);
      break;
    case 4:
      // Diagonale du bas vers le haut
      paths.push(`M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY}`);
      break;
    case 5:
      // 1 + 4
      paths.push(
        `M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`, // 1
        `M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY}` // 4
      );
      break;
    case 6:
      // Trait vertical
      paths.push(`M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`);
      break;
    case 7:
      // 1 + 6
      paths.push(
        `M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`, // 1
        `M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}` // 6
      );
      break;
    case 8:
      // 2 + 6
      paths.push(
        `M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`, // 2
        `M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}` // 6
      );
      break;
    case 9:
      // 1 + 2 + 6
      paths.push(
        `M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`, // 1
        `M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`, // 2
        `M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}` // 6
      );
      break;
  }

  return paths;
}

export function getDigitDescription(digit: number): string {
  switch (digit) {
    case 1:
      return "Un simple trait horizontal tout en haut";
    case 2:
      return "Un simple trait horizontal en bas";
    case 3:
      return "Une diagonale du haut vers le bas";
    case 4:
      return "Une diagonale du bas vers le haut";
    case 5:
      return "Superposition du 1 et du 4";
    case 6:
      return "Un trait vertical espacé de l'axe central";
    case 7:
      return "Superposition du 1 et du 6";
    case 8:
      return "Superposition du 2 et du 6";
    case 9:
      return "Superposition du 1, 2 et 6";
    default:
      return "";
  }
} 