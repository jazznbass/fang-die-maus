import { createBreakPlugin } from './BreakPlugin.js';

/** Constructs keyboard-only block breaks. */
export class Screens {
  static break(config, nextBlock, context, previousBlock) {
    return {
      type: createBreakPlugin(context),
      block: nextBlock,
      previousBlock,
      message: config.instructions.break,
    };
  }
}
