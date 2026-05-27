import Globe from 'ascii-globe';
import fs from 'fs';

const g = new Globe({ width: 100 });
const frames = [];

// Generate more frames with a smaller time step for smoothness
for (let i = 0; i < 300; i++) {
  // 20ms step size for very small angle increments
  frames.push(g.render(i * 20));
}

const content = `export const earthFrames = [\n${frames.map(f => '`' + f.replace(/`/g, '\\`') + '`').join(',\n')}\n];\n`;
fs.writeFileSync('src/components/ui/earthFrames.ts', content);
console.log("300 smooth frames generated!");
