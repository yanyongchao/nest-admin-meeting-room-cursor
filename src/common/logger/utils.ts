import * as fs from 'fs';
import * as path from 'path';

/**
 * 确保日志目录存在
 * @param dirPath 目录路径
 * @returns 创建成功返回true，目录已存在也返回true
 */
export function ensureLogDirectoryExists(dirPath: string = 'logs'): boolean {
  try {
    const absolutePath = path.isAbsolute(dirPath)
      ? dirPath
      : path.join(process.cwd(), dirPath);

    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
      console.info(`日志目录创建成功: ${absolutePath}`);
    }
    return true;
  } catch (error) {
    console.error(`创建日志目录失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查日志文件夹权限
 * @param dirPath 目录路径
 * @returns 检查结果
 */
export function checkLogDirectoryPermissions(
  dirPath: string = 'logs',
): boolean {
  try {
    const absolutePath = path.isAbsolute(dirPath)
      ? dirPath
      : path.join(process.cwd(), dirPath);

    // 确保目录存在
    if (!fs.existsSync(absolutePath)) {
      return false;
    }

    // 检查读写权限
    fs.accessSync(absolutePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (error) {
    console.error(`日志目录权限检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 日志文件名生成器
 * @param prefix 文件名前缀
 * @param date 日期对象
 * @returns 格式化的日志文件名
 */
export function generateLogFileName(
  prefix: string,
  date: Date = new Date(),
): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}-${dateStr}.log`;
}
