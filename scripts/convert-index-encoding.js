const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'index.html');
try {
  const data = fs.readFileSync(file);
  // Detect BOM
  if (data.length >= 2 && data[0] === 0xFF && data[1] === 0xFE) {
    // UTF-16 LE with BOM
    const text = data.toString('utf16le');
    fs.writeFileSync(file, text, { encoding: 'utf8' });
    console.log('Converted index.html from UTF-16 LE (BOM) to UTF-8');
  } else if (data.length >= 2 && data[0] === 0xFE && data[1] === 0xFF) {
    // UTF-16 BE with BOM - swap
    const swapped = Buffer.allocUnsafe(data.length - 2);
    // strip BOM then swap bytes
    for (let i = 2; i < data.length; i += 2) {
      const hi = data[i];
      const lo = data[i+1] || 0;
      swapped[i-2] = lo;
      swapped[i-1] = hi;
    }
    const text = swapped.toString('utf16le');
    fs.writeFileSync(file, text, { encoding: 'utf8' });
    console.log('Converted index.html from UTF-16 BE (BOM) to UTF-8');
  } else {
    // Heuristic: check for many null bytes -> UTF-16LE/BE without BOM
    const sample = Math.min(200, data.length);
    let zerosEven = 0, zerosOdd = 0;
    for (let i = 0; i < sample; i++) {
      if (data[i] === 0x00) {
        if (i % 2 === 0) zerosEven++; else zerosOdd++;
      }
    }
    if (zerosOdd > 10 || zerosEven > 10) {
      let text;
      if (zerosOdd > zerosEven) {
        text = data.toString('utf16le');
        fs.writeFileSync(file, text, { encoding: 'utf8' });
        console.log('Converted index.html from UTF-16LE (no BOM) to UTF-8');
      } else {
        // UTF-16BE no BOM: swap
        const swapped = Buffer.allocUnsafe(data.length);
        for (let i = 0; i < data.length; i += 2) {
          swapped[i] = data[i+1] || 0;
          swapped[i+1] = data[i] || 0;
        }
        const text = swapped.toString('utf16le');
        fs.writeFileSync(file, text, { encoding: 'utf8' });
        console.log('Converted index.html from UTF-16BE (no BOM) to UTF-8');
      }
    } else {
      console.log('index.html appears to be UTF-8 already; no change made');
    }
  }
} catch (e) {
  console.error('Conversion failed:', e.message);
  process.exit(1);
}
