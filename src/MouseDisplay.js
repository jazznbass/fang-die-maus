/** Only presentation: this class neither measures RT nor decides trial order. */
export class MouseDisplay {
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.holes = new Map();
  }

  static async preload() {
    await Promise.all(['assets/mouse-transparent.png', 'assets/cage.svg', 'assets/cheese.svg', 'assets/summary-cheese.svg'].map(async source => {
      const image = new Image();
      image.src = source;
      await image.decode();
    }));
  }

  mount() {
    this.element.innerHTML = '<section class="task" aria-label="Mäuse fangen"><div class="holes"></div><p class="feedback" aria-live="polite"></p></section>';
    const row = this.element.querySelector('.holes');
    for (const position of this.config.positions) {
      const hole = document.createElement('div');
      hole.className = 'hole';
      hole.dataset.position = position.id;
      hole.style.setProperty('--hole-color', position.color);
      const mouse = document.createElement('img');
      mouse.src = 'assets/mouse-transparent.png';
      mouse.alt = '';
      mouse.className = 'mouse';
      hole.append(mouse);
      const cheese = document.createElement('img');
      cheese.src = 'assets/cheese.svg';
      cheese.alt = '';
      cheese.className = 'error-cheese';
      hole.append(cheese);
      const bars = document.createElement('div');
      bars.className = 'cage-bars';
      hole.append(bars);
      row.append(hole);
      this.holes.set(position.id, hole);
      if (this.config.presentation.showKeyLabels) {
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = position.keyLabel;
        hole.append(label);
      }
    }
  }

  clear() {
    for (const hole of this.holes.values()) hole.classList.remove('target', 'caught', 'escaped');
    this.element.querySelector('.feedback').textContent = '';
  }

  showTarget(id) {
    this.clear();
    this.holes.get(id).classList.add('target');
  }

  showFeedback(id, correct) {
    if (this.config.feedback.visual) this.holes.get(id).classList.add(correct ? 'caught' : 'escaped');
    else this.clear();
    if (this.config.feedback.text) {
      this.element.querySelector('.feedback').textContent = correct ? 'Gefangen!' : 'Die Maus ist entkommen.';
    }
  }
}
