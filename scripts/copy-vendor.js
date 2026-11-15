import { copyFile, mkdir } from 'node:fs/promises';

// Run after npm install. The experiment itself never needs the npm registry.
await mkdir('vendor', { recursive: true });
for (const [source, destination] of [
  ['jspsych/dist/index.browser.js', 'jspsych.js'],
  ['jspsych/css/jspsych.css', 'jspsych.css'],
  ['@jspsych/plugin-html-button-response/dist/index.browser.js', 'html-button-response.js'],
]) {
  await copyFile(`node_modules/${source}`, `vendor/${destination}`);
}
console.log('Local jsPsych files copied to vendor/.');
