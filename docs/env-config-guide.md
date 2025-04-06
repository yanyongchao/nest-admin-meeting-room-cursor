# 环境配置文件使用指南

## 环境配置文件

项目使用不同的环境配置文件来管理不同环境的配置参数：

- `.dev.env` - 开发环境配置
- `.test.env` - 测试环境配置
- `.prod.env` - 生产环境配置

## 环境文件在构建过程中的处理

为了确保构建后的应用能正确加载环境配置文件，我们采用了以下解决方案：

### 1. 自动复制环境文件到dist目录

在 `nest-cli.json` 中配置了assets选项，使得构建时自动将环境文件复制到dist目录：

```json
"compilerOptions": {
  "deleteOutDir": true,
  "assets": [
    { 
      "include": "../*.env", 
      "outDir": "./dist" 
    }
  ],
  "watchAssets": true
}
```

### 2. 通过npm脚本确保复制

为了双重保险，我们在 `package.json` 的build脚本中添加了复制命令：

```json
"scripts": {
  "build": "nest build && npm run copy-env",
  "copy-env": "cp .*.env dist/"
}
```

### 3. 智能查找环境文件路径

应用启动时会按照以下优先级查找环境文件：

1. 通过 `ENV_PATH` 环境变量直接指定的路径
2. 项目根目录
3. dist目录
4. dist的父目录

## 如何在不同环境中启动应用

### 开发环境

```bash
npm run start:dev
# 或
NODE_ENV=dev npm start
```

### 测试环境

```bash
npm run start:test
# 或
NODE_ENV=test npm start
```

### 生产环境

```bash
# 先构建
npm run build

# 然后启动
npm run start:prod
# 或
NODE_ENV=prod node dist/main
```

## 故障排查

如果遇到环境文件无法加载的问题，请检查：

1. 环境文件是否存在于正确的位置
2. 启动命令中是否正确设置了 `NODE_ENV` 环境变量
3. 检查应用启动时的日志，了解环境文件的查找路径

### 手动指定环境文件路径

在特殊情况下，可以通过 `ENV_PATH` 环境变量直接指定环境文件的完整路径：

```bash
ENV_PATH=/absolute/path/to/.prod.env NODE_ENV=prod node dist/main
```

## 生产环境部署注意事项

1. 构建前确保已正确配置所有环境文件
2. 在CI/CD流程中，可以通过脚本动态生成环境配置文件
3. 对于敏感信息，建议使用环境变量注入而非配置文件
4. 确保服务器上的 `NODE_ENV` 环境变量设置正确