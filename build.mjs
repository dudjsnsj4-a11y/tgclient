import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

fs.writeFileSync('entry.js', "export * from 'telegram';\n");
fs.writeFileSync('shim.js', "import { Buffer } from 'buffer';\nimport process from 'process';\nexport { Buffer, process };\n");

const cryptoPath = path.resolve('node_modules/telegram/crypto/crypto.js');
const STUBS = /^(fs|os|path|net|tls|socks|node-localstorage)$/;

const plugin = {
  name: 'gramjs-browser',
  setup(b) {
    b.onResolve({ filter: /^crypto$/ }, () => ({ path: cryptoPath }));
    b.onResolve({ filter: STUBS }, a => ({ path: a.path, namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'module.exports = {};', loader: 'js' }));
  },
};

await esbuild.build({
  entryPoints: ['entry.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  outfile: 'telegram.js',
  inject: ['shim.js'],
  define: { global: 'globalThis' },
  plugins: [plugin],
  logLevel: 'info',
});
console.log('OK');
