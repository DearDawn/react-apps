const fs = require('fs');
const packageJson = require('./package.json');

// 获取当前日期和时间
const buildTime = new Date().toISOString();

// 获取当前版本号
const version = packageJson.version;

// 构建要写入的内容
const envContent = `BUILD_TIME=${buildTime}\nVERSION=${version}`;

// 将内容写入到 .env 文件
fs.writeFileSync('.env', envContent);