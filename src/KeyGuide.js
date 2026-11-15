/** Uses the configured order, colors and labels for the response keys. */
export class KeyGuide {
  static create(positions) {
    const guide = document.createElement('div');
    guide.className = 'key-guide circular-keys';
    for (const position of positions) {
      const key = document.createElement('span');
      key.className = 'key-chip';
      key.style.setProperty('--hole-color', position.color);
      key.textContent = position.keyLabel;
      guide.append(key);
    }
    return guide;
  }
}
