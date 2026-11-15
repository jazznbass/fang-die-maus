/** Short picture-led instructions; colors and keys always match the task. */
export class InstructionDisplay {
  static render(element, config, page, condition) {
    const texts = config.instructions;
    const screen = document.createElement('section');
    screen.className = `child-instructions instruction-page-${page}`;
    if (page === 2) {
      this.outcomes(screen, config);
      element.replaceChildren(screen);
      return;
    }
    const heading = document.createElement('h1');
    heading.textContent = page === 0 ? texts.title : page === 1 ? texts.controlsTitle : texts.extraTitle;
    const message = document.createElement('p');
    message.className = 'instruction-copy';
    message.textContent = page === 0 ? texts.story : page === 1 ? texts.general
      : config.conditions[condition].additionalInstruction;
    screen.append(heading, message);
    if (page < 2) screen.append(this.picture(config.positions, page === 1));
    const action = document.createElement('p');
    action.className = 'instruction-action';
    action.textContent = page === 0 ? texts.storyAction : page === 1 ? texts.controlsAction : '';
    const continuation = document.createElement('p');
    continuation.className = 'instruction-continue';
    continuation.textContent = page === 1 ? texts.questions : texts.nextPage;
    if (action.textContent) screen.append(action);
    screen.append(continuation);
    element.replaceChildren(screen);
  }

  static outcomes(screen, config) {
    for (const [state, text] of [['caught', config.instructions.caughtExample],
      ['escaped', config.instructions.escapedExample]]) {
      const message = document.createElement('p');
      message.textContent = text;
      screen.append(message, this.picture(config.positions, false, state));
    }
    const continuation = document.createElement('p');
    continuation.className = 'instruction-continue';
    continuation.textContent = config.instructions.outcomesContinue;
    screen.append(continuation);
  }

  static picture(positions, showKeys, outcome = null) {
    const picture = document.createElement('div');
    picture.className = 'instruction-picture';
    const row = document.createElement('div');
    row.className = 'instruction-holes';
    positions.forEach((position, index) => {
      const column = document.createElement('div');
      column.className = 'instruction-hole-column';
      const hole = document.createElement('div');
      hole.className = `hole${index === 1 ? ` target ${outcome ?? ''}` : ''}`;
      hole.style.setProperty('--hole-color', position.color);
      if (index === 1) {
        const mouse = document.createElement('img');
        mouse.src = 'assets/mouse-transparent.png';
        mouse.className = 'mouse';
        mouse.alt = 'Eine Maus schaut aus dem Loch.';
        hole.append(mouse);
        if (outcome === 'caught') {
          const bars = document.createElement('div');
          bars.className = 'cage-bars';
          bars.setAttribute('aria-hidden', 'true');
          hole.append(bars);
          mouse.alt = 'Die Maus ist gefangen.';
        }
        if (outcome === 'escaped') {
          const cheese = document.createElement('img');
          cheese.src = 'assets/cheese.svg';
          cheese.className = 'error-cheese';
          cheese.alt = 'Die Maus nimmt den Käse mit.';
          hole.append(cheese);
        }
      }
      column.append(hole);
      if (showKeys) {
        const key = document.createElement('span');
        key.className = 'key-chip';
        key.style.setProperty('--hole-color', position.color);
        key.textContent = position.keyLabel;
        column.append(key);
      }
      row.append(column);
    });
    picture.append(row);
    if (!showKeys && !outcome) {
      const cheese = document.createElement('img');
      cheese.src = 'assets/cheese.svg';
      cheese.alt = 'Der Käse';
      cheese.className = 'instruction-cheese';
      picture.append(cheese);
    }
    return picture;
  }
}
