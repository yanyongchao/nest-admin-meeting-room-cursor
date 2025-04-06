import { ConfigService } from '@nestjs/config';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import {
  ensureLogDirectoryExists,
  checkLogDirectoryPermissions,
} from './utils';

// 自定义JSON格式，确保时间戳在最前面并美化输出
const orderedJsonFormat = winston.format.printf((info) => {
  const { timestamp, level, message, ...rest } = info;

  // 创建带有顺序的对象
  const orderedObj = {
    timestamp,
    level: level.toUpperCase(),
    message,
  };

  // 添加剩余的属性
  const fullObj = { ...orderedObj, ...rest };

  // 转换为美化的JSON字符串，使用2个空格缩进
  return JSON.stringify(fullObj, null, 2);
});

// 压缩版的JSON格式，用于生产环境
const compactJsonFormat = winston.format.printf((info) => {
  const { timestamp, level, message, ...rest } = info;

  // 创建带有顺序的对象
  const orderedObj = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...rest,
  };

  // 返回单行JSON
  return JSON.stringify(orderedObj);
});

// 日志文件格式化配置
const createFileLogFormat = (detailed = false, isProduction = false) => {
  const formats = [
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
  ];

  // 详细模式包含更多信息
  if (detailed) {
    formats.push(
      winston.format((info) => {
        info.detailed = true;
        return info;
      })(),
    );
  }

  // 根据环境选择格式
  formats.push(isProduction ? compactJsonFormat : orderedJsonFormat);

  return winston.format.combine(...formats);
};

export const loggerConfig = (
  configService: ConfigService,
): WinstonModuleOptions => {
  const env = configService.get('NODE_ENV') || 'development';
  const isProduction = env === 'production';

  // 日志目录
  const logDir = path.join(process.cwd(), 'logs');

  // 确保日志目录存在
  ensureLogDirectoryExists(logDir);

  // 检查日志目录权限
  const hasPermission = checkLogDirectoryPermissions(logDir);
  if (!hasPermission) {
    console.warn(`警告：日志目录 ${logDir} 权限不足，可能导致日志无法写入`);
  }

  // 基本日志格式
  const basicFileLogFormat = createFileLogFormat(false, isProduction);

  // 详细日志格式(包含更多信息，用于错误日志)
  const detailedFileLogFormat = createFileLogFormat(true, isProduction);

  // 控制台日志格式
  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    nestWinstonModuleUtilities.format.nestLike('会议室预订系统', {
      prettyPrint: true,
      colors: true,
    }),
  );

  // 日志切割配置
  const fileRotateTransport = new winston.transports.DailyRotateFile({
    dirname: logDir,
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: basicFileLogFormat,
    level: isProduction ? 'info' : 'debug',
  });

  // 错误日志切割配置
  const errorRotateTransport = new winston.transports.DailyRotateFile({
    dirname: logDir,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: detailedFileLogFormat,
    level: 'error',
  });

  // 控制台输出配置
  const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    level: isProduction ? 'info' : 'debug',
  });

  return {
    transports: [consoleTransport, fileRotateTransport, errorRotateTransport],
    // 添加异常处理
    exitOnError: false,
    // 添加默认元数据
    defaultMeta: {
      service: '会议室预订系统',
      env: env,
    },
  };
};
