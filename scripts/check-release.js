/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} (未找到: ${filePath})`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const fullPath = path.resolve(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    if (files.length > 0) {
      log(`⚠️  ${description} (存在 ${files.length} 个文件，建议移至OSS)`, 'yellow');
      return false;
    } else {
      log(`✅ ${description} (目录为空)`, 'green');
      return true;
    }
  } else {
    log(`✅ ${description} (目录不存在)`, 'green');
    return true;
  }
}

function checkBuildOutput() {
  const buildPath = path.resolve(__dirname, '..', 'dist', 'build', 'mp-weixin');
  if (!fs.existsSync(buildPath)) {
    log(`❌ 构建输出不存在，请先运行: npm run build:mp-weixin`, 'red');
    return false;
  }

  // 检查构建输出大小
  function getSize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getSize(filePath);
      } else {
        size += stat.size;
      }
    }
    return size;
  }

  const totalSize = getSize(buildPath);
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

  if (totalSize > 2 * 1024 * 1024) {
    log(`⚠️  构建输出大小: ${sizeMB}MB (超过2MB限制，可能导致上传失败)`, 'yellow');
    return false;
  } else {
    log(`✅ 构建输出大小: ${sizeMB}MB (在限制范围内)`, 'green');
    return true;
  }
}

function checkManifest() {
  const manifestPath = path.resolve(__dirname, '..', 'src', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    log(`❌ manifest.json 不存在`, 'red');
    return false;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const issues = [];

  if (!manifest['mp-weixin'] || !manifest['mp-weixin'].appid) {
    issues.push('AppID 未配置');
  } else if (manifest['mp-weixin'].appid !== 'wx8cd8f77196c7dc35') {
    issues.push(`AppID 不匹配: ${manifest['mp-weixin'].appid}`);
  }

  if (!manifest.name || manifest.name === '') {
    issues.push('小程序名称未配置');
  }

  if (!manifest.description || manifest.description === '') {
    issues.push('小程序描述未配置');
  }

  if (issues.length > 0) {
    log(`⚠️  manifest.json 配置问题:`, 'yellow');
    issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
    return false;
  } else {
    log(`✅ manifest.json 配置正确`, 'green');
    return true;
  }
}

function checkOSSReferences() {
  const srcPath = path.resolve(__dirname, '..', 'src');
  const ossPattern = /yueyun-videos\.oss-cn-guangzhou\.aliyuncs\.com/g;
  let found = false;

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !filePath.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.vue') || file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (ossPattern.test(content)) {
          found = true;
        }
      }
    }
  }

  scanDirectory(srcPath);

  if (found) {
    log(`✅ 代码中已使用OSS资源`, 'green');
    return true;
  } else {
    log(`⚠️  代码中未检测到OSS资源引用`, 'yellow');
    return false;
  }
}

// 主检查流程
console.log('\n📋 发布前检查清单\n');
console.log('='.repeat(50));

const results = {
  build: checkBuildOutput(),
  manifest: checkManifest(),
  ciKey: checkFile('ci/private.key', 'CI上传密钥文件'),
  ossRefs: checkOSSReferences(),
  localAudio: checkDirectory('src/static/audio', '本地音频文件目录'),
  localVideos: checkDirectory('videos', '本地视频文件目录'),
  localPictures: checkDirectory('picture-books', '本地绘本图片目录'),
};

console.log('\n' + '='.repeat(50));

const allPassed = Object.values(results).every(r => r === true);

if (allPassed) {
  log('\n✅ 所有检查通过！可以开始发布流程。', 'green');
  log('\n📝 下一步：', 'blue');
  log('1. 确保微信公众平台已配置服务器域名', 'blue');
  log('2. 运行: npm run build:mp-weixin', 'blue');
  log('3. 使用微信开发者工具上传代码，或运行: npm run ci:upload', 'blue');
  log('4. 在微信公众平台提交审核', 'blue');
} else {
  log('\n⚠️  部分检查未通过，请先解决上述问题再发布。', 'yellow');
  log('\n📚 详细发布指南请查看: 小程序发布完整指南.md', 'blue');
}

console.log('\n');

