import fs from 'fs';

const fontPath = '/Users/linabenna/Desktop/test-uni-email/Nabra-current-save/client/src/fonts-used/Noto_Sans/NotoSans-Bold.ttf';
const outputPath = '/Users/linabenna/Desktop/test-uni-email/Nabra-current-save/client/src/fonts-used/Noto_Sans/NotoSans-Bold.txt';

const base64 = fs.readFileSync(fontPath).toString('base64');
fs.writeFileSync(outputPath, base64);

console.log('✅ Font converted to base64 and saved to NotoSans-Regular-base64.txt');
