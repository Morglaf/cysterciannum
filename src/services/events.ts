type EventCallback = (data: any) => void;

class EventEmitter {
  private listeners: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const EVENTS = {
  XP_UPDATED: 'xp_updated'
} as const;

export const eventEmitter = new EventEmitter();

// Fonction utilitaire pour émettre l'événement de mise à jour XP
export const emitXPUpdate = (xp: number) => {
  eventEmitter.emit(EVENTS.XP_UPDATED, xp);
}; 