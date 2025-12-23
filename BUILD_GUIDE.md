# 构建指南

本项目支持多环境构建，可以轻松生成测试环境和正式环境的部署包。

## ✅ 已完成配置

所有配置已经完成，你可以直接使用！

## 🚀 快速开始（推荐）

**最简单的方法：双击运行**
1. 双击 `build.bat` 文件
2. 等待构建完成（约15-20秒）
3. 在项目根目录会生成两个文件：
   - `build_test.zip` - 测试环境（API: https://test.alphanow.io）
   - `build_production.zip` - 正式环境（API: https://alphanow.io）

## 方案一：使用环境变量（推荐）⭐

### 环境配置

项目包含三个环境配置文件：

- `.env.development` - 开发环境（默认使用测试API）
- `.env.test` - 测试环境
- `.env.production` - 正式环境

### 构建命令

#### 1. 开发环境运行
```bash
npm run dev
```

#### 2. 构建测试环境
```bash
npm run build:test
```
生成的文件在 `build` 目录，使用测试API地址：`https://test.alphanow.io`

#### 3. 构建正式环境
```bash
npm run build:prod
```
生成的文件在 `build` 目录，使用正式API地址：`https://alphanow.io`

#### 4. 一键构建并打包（推荐）

**Windows PowerShell:**
```powershell
.\build-all.ps1
```

**或使用 Node.js 脚本（需要先安装依赖）:**
```bash
npm install
npm run build:all
```

这个命令会：
1. 构建测试环境
2. 将测试环境打包成 `build_测试.zip`
3. 构建正式环境
4. 将正式环境打包成 `build_正式.zip`

### 首次使用

如果使用 Node.js 脚本方式，需要先安装 archiver 依赖：
```bash
npm install
```

### 输出文件

运行 `build-all.ps1` 或 `npm run build:all` 后，会在项目根目录生成：
- `build_测试.zip` - 测试环境部署包
- `build_正式.zip` - 正式环境部署包

### API 地址配置

API地址通过环境变量 `VITE_API_BASE_URL` 控制：

- **测试环境**: `https://test.alphanow.io`
- **正式环境**: `https://alphanow.io`

如需修改，编辑对应的 `.env.*` 文件即可。

### 部署

1. 将对应的 zip 文件上传到服务器
2. 解压到 web 服务器目录
3. 配置 nginx 或其他 web 服务器指向该目录

### 优势

✅ 只需一个命令即可生成两个环境的部署包  
✅ 环境配置清晰，易于维护  
✅ 避免手动修改代码的错误  
✅ 支持添加更多环境（如预发布环境）  
✅ 符合现代前端工程化最佳实践  

## 方案二：手动构建（不推荐）

如果不想使用环境变量，可以手动修改 `src/services/api.ts` 中的 `API_BASE_URL`，然后运行：
```bash
npm run build
```

但这种方式容易出错，不推荐使用。

