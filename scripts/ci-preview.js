/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const ci = require('miniprogram-ci');

async function main() {
  const appid = process.env.WEAPP_APPID || 'wx8cd8f77196c7dc35';
  const projectPath = process.env.WEAPP_PROJECT_PATH || path.resolve(__dirname, '..', 'dist', 'build', 'mp-weixin');
  const privateKeyPath = process.env.WEAPP_PRIVATE_KEY || path.resolve(__dirname, '..', 'ci', 'private.key');

  if (!fs.existsSync(projectPath)) {
    console.error(`[ci] projectPath not found: ${projectPath}\nPlease run: npm run build:mp-weixin`);
    process.exit(2);
  }
  if (!fs.existsSync(privateKeyPath)) {
    console.error(`[ci] private key not found: ${privateKeyPath}\nDownload it from WeChat Mini Program Console → Development Settings → Code Upload Key.`);
    process.exit(3);
  }

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  console.log('[ci] generating preview…');
  const result = await ci.preview({
    project,
    qrcodeFormat: 'image',
    qrcodeOutputDest: path.resolve(__dirname, '..', 'ci', 'preview-qrcode.png'),
    desc: process.env.CI_DESC || 'Dev Preview',
    useCOS: false,
    setting: {
      es6: true,
      minifyJS: false,
      minifyWXML: false,
      minifyWXSS: false,
      autoPrefixWXSS: true,
    },
  });

  console.log('[ci] preview success');
  console.log(result);
}

main().catch((err) => {
  console.error('[ci] preview failed');
  console.error(err);
  process.exit(1);
});


