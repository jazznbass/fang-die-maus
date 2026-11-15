/** Mulberry32: deterministic trial planning from a saved 32-bit seed. */
export class RandomGenerator {
  constructor(seed) { this.state = seed >>> 0; }

  next() {
    let value = this.state += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }

  choose(values) { return values[Math.floor(this.next() * values.length)]; }
}
