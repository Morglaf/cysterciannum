class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private isMuted: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    const baseUrl = 'http://localhost:3000/sounds';
    // Créer les éléments audio pour chaque son
    this.sounds = {
      correct: new Audio(`${baseUrl}/correct.mp3`),
      incorrect: new Audio(`${baseUrl}/incorrect.mp3`),
      achievement: new Audio(`${baseUrl}/achievement.mp3`),
      levelUp: new Audio(`${baseUrl}/level-up.mp3`),
      click: new Audio(`${baseUrl}/click.mp3`)
    };

    // Précharger les sons
    Object.values(this.sounds).forEach(sound => {
      sound.load();
      sound.volume = 0.5; // Volume par défaut à 50%
    });
  }

  public playSound(soundName: 'correct' | 'incorrect' | 'achievement' | 'levelUp' | 'click') {
    if (this.isMuted) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0; // Réinitialiser le son
      sound.play().catch(error => {
        console.warn('Erreur lors de la lecture du son:', error);
      });
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setVolume(volume: number) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = normalizedVolume;
    });
  }
}

export const soundManager = new SoundManager(); 