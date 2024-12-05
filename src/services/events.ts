import EventEmitter from 'events';

export const EVENTS = {
  XP_UPDATED: 'xp_updated'
} as const;

export const eventEmitter = new EventEmitter();

// Fonction utilitaire pour émettre l'événement de mise à jour XP
export const emitXPUpdate = (xp: number) => {
  eventEmitter.emit(EVENTS.XP_UPDATED, xp);
}; 