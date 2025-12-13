const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('🚀 开始构建测试和正式环境...\n');

// 构建目录
const buildDir = path.join(__dirname, '../build');
const testZip = path.join(__dirname, '../build_测试.zip');
const prodZip = path.join(__dirname, '../build_正式.zip');

// 删除旧的zip文件
if (fs.existsSync(testZip)) {
  fs.unlinkSync(testZip);
  console.log('✅ 已删除旧的测试环境zip文件');
}
if (fs.existsSync(prodZip)) {
  fs.unlinkSync(prodZip);
  console.log('✅ 已删除旧的正式环境zip文件');
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
      console.log(`✅ ${envName}环境打包完成: ${sizeMB} MB`);
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

// 构建测试环境
console.log('📦 正在构建测试环境...');
try {
  execSync('npm run build:test', { stdio: 'inherit' });
  console.log('✅ 测试环境构建完成\n');
  
  console.log('📦 正在打包测试环境...');
  createZip(buildDir, testZip, '测试').then(() => {
    console.log('');
    
    // 构建正式环境
    console.log('📦 正在构建正式环境...');
    execSync('npm run build:prod', { stdio: 'inherit' });
    console.log('✅ 正式环境构建完成\n');
    
    console.log('📦 正在打包正式环境...');
    return createZip(buildDir, prodZip, '正式');
  }).then(() => {
    console.log('\n🎉 所有构建和打包完成！');
    console.log(`📁 测试环境: ${testZip}`);
    console.log(`📁 正式环境: ${prodZip}`);
  }).catch((err) => {
    console.error('❌ 打包失败:', err);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}

