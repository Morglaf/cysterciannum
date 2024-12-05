import { Point } from '../types/cistercian';

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
      paths.push(`M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`);
      break;
    case 2:
      paths.push(`M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`);
      break;
    case 3:
      paths.push(`M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`);
      break;
    case 4:
      paths.push(`M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY}`);
      break;
    case 5:
      paths.push(
        `M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`,
        `M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY}`
      );
      break;
    case 6:
      paths.push(`M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`);
      break;
    case 7:
      paths.push(
        `M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`,
        `M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`
      );
      break;
    case 8:
      paths.push(
        `M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`,
        `M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`
      );
      break;
    case 9:
      paths.push(
        `M ${baseX} ${baseY} L ${baseX + (25 * direction)} ${baseY}`,
        `M ${baseX} ${baseY + (25 * yDirection)} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`,
        `M ${baseX + (25 * direction)} ${baseY} L ${baseX + (25 * direction)} ${baseY + (25 * yDirection)}`
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