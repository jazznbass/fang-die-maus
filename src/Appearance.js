/** Applies the selected study's background to every experiment screen. */
export class Appearance {
  static apply(config) {
    document.documentElement.style.setProperty('--study-background', config.presentation.backgroundColor);
  }
}
