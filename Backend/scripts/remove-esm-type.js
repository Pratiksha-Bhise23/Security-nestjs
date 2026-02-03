const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', '.serverless', 'build', 'package.json');

try {
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.type === 'module') {
      delete pkg.type;
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
      console.log('✓ Removed "type": "module" from .serverless/build/package.json');
    }
  }
} catch (error) {
  console.error('Error removing ESM type:', error.message);
  process.exit(1);
}
