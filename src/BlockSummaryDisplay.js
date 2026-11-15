/** Visual block feedback, independent of keyboard handling and trial timing. */
export class BlockSummaryDisplay {
  constructor(element) { this.element = element; }

  render(summary) {
    this.element.innerHTML = `<div class="block-summary">
      <section class="outcome-panel"><h2><strong>${summary.caught}</strong> gefangen</h2>
        <div class="summary-scene cage-scene"><div class="summary-mice"></div>
          <img class="summary-cage" src="assets/cage.svg" alt="" aria-hidden="true"></div>
        <!-- <p class="outcome-caption">Im Käfig</p> -->
        </section>
      <section class="outcome-panel"><h2><strong>${summary.escaped}</strong> entkommen</h2>
        <div class="summary-scene cheese-scene">
          <img class="summary-cheese" src="assets/summary-cheese.svg" alt="" aria-hidden="true">
          <div class="summary-mice"></div></div>
        <!-- <p class="outcome-caption">Auf dem Käse</p> -->
        </section>
      </div>`;
    this.fillMice(this.element.querySelector('.cage-scene .summary-mice'), summary.caught);
    this.fillMice(this.element.querySelector('.cheese-scene .summary-mice'), summary.escaped);
  }

  fillMice(group, count) {
    // Show every mouse in a normal 96-trial block. Bound rendering for very long custom blocks.
    const shown = Math.min(count, 96);
    group.classList.add(shown > 48 ? 'many-mice' : shown > 12 ? 'some-mice' : 'few-mice');
    group.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < shown; index++) {
      const mouse = document.createElement('img');
      mouse.src = 'assets/mouse-transparent.png';
      mouse.alt = '';
      group.append(mouse);
    }
    if (count === 0) group.textContent = 'Keine';
    if (count > shown) {
      const remainder = document.createElement('span');
      remainder.className = 'mouse-remainder';
      remainder.textContent = `+ ${count - shown} weitere`;
      group.append(remainder);
    }
  }
}
