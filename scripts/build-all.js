const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

log('\n' + '='.repeat(60), colors.bright);
log('🚀 AlphaNow 多环境打包工具', colors.bright);
log('='.repeat(60) + '\n', colors.bright);

// 构建目录
const buildDir = path.join(__dirname, '../build');
const testZip = path.join(__dirname, '../build_test.zip');
const prodZip = path.join(__dirname, '../build_production.zip');

// 删除旧的zip文件
if (fs.existsSync(testZip)) {
  fs.unlinkSync(testZip);
  log('✅ 已删除旧的 build_test.zip', colors.yellow);
}
if (fs.existsSync(prodZip)) {
  fs.unlinkSync(prodZip);
  log('✅ 已删除旧的 build_production.zip', colors.yellow);
}

// 清理构建目录
function cleanBuildDir() {
  if (fs.existsSync(buildDir)) {
    log('\n🧹 清理旧的构建文件...', colors.yellow);
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
}

// 创建zip文件的函数
function createZip(sourceDir, outputPath, envName) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      log(`✓ ${envName}环境打包完成: ${path.basename(outputPath)} (${sizeMB} MB)`, colors.green);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

// 主函数
async function main() {
  const startTime = Date.now();

  try {
    // 构建测试环境
    log('\n' + '='.repeat(60), colors.blue);
    log('📦 开始构建 TEST 环境', colors.bright);
    log('='.repeat(60), colors.blue);

    cleanBuildDir();
    log('\n⚙️  正在执行构建命令: vite build --mode test', colors.yellow);
    execSync('npm run build:test', { stdio: 'inherit' });
    log('\n✅ 测试环境构建完成', colors.green);

    log('\n📦 正在压缩构建文件...', colors.yellow);
    await createZip(buildDir, testZip, '测试');

    // 构建生产环境
    log('\n' + '='.repeat(60), colors.blue);
    log('📦 开始构建 PRODUCTION 环境', colors.bright);
    log('='.repeat(60), colors.blue);

    cleanBuildDir();
    log('\n⚙️  正在执行构建命令: vite build --mode production', colors.yellow);
    execSync('npm run build:prod', { stdio: 'inherit' });
    log('\n✅ 生产环境构建完成', colors.green);

    log('\n📦 正在压缩构建文件...', colors.yellow);
    await createZip(buildDir, prodZip, '生产');

    // 完成
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('\n' + '='.repeat(60), colors.green);
    log(`🎉 所有环境构建完成！总耗时: ${duration}秒`, colors.green);
    log('='.repeat(60), colors.green);

    log('\n📦 生成的文件:', colors.blue);
    log(`  - build_test.zip (测试环境)`, colors.blue);
    log(`  - build_production.zip (生产环境)\n`, colors.blue);

  } catch (error) {
    log(`\n❌ 构建失败: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// 运行主函数
main();

