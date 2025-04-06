import { Injectable, Logger, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LogCategory, LogLevel } from './logger.constants';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param category 日志分类
   * @param data 附加数据
   */
  info(message: string, category: LogCategory, data?: any): void {
    this.log(message, LogLevel.INFO, category, data);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param category 日志分类
   * @param data 附加数据
   */
  warn(message: string, category: LogCategory, data?: any): void {
    this.log(message, LogLevel.WARN, category, data);
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param category 日志分类
   * @param error 错误对象
   * @param data 附加数据
   */
  error(
    message: string,
    category: LogCategory,
    error?: Error,
    data?: any,
  ): void {
    const logData = {
      ...data,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    this.log(message, LogLevel.ERROR, category, logData);
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param category 日志分类
   * @param data 附加数据
   */
  debug(message: string, category: LogCategory, data?: any): void {
    this.log(message, LogLevel.DEBUG, category, data);
  }

  /**
   * 记录详细日志
   * @param message 日志消息
   * @param category 日志分类
   * @param data 附加数据
   */
  verbose(message: string, category: LogCategory, data?: any): void {
    this.log(message, LogLevel.VERBOSE, category, data);
  }

  /**
   * 通用日志方法
   * @param message 日志消息
   * @param level 日志级别
   * @param category 日志分类
   * @param data 附加数据
   */
  private log(
    message: string,
    level: LogLevel,
    category: LogCategory,
    data?: any,
  ): void {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        level,
        message,
        category,
        ...data,
      };

      switch (level) {
        case LogLevel.ERROR:
          this.logger.error(logData);
          break;
        case LogLevel.WARN:
          this.logger.warn(logData);
          break;
        case LogLevel.INFO:
          this.logger.log(logData);
          break;
        case LogLevel.DEBUG:
          this.logger.debug && this.logger.debug(logData);
          break;
        case LogLevel.VERBOSE:
          this.logger.verbose && this.logger.verbose(logData);
          break;
      }
    } catch (error) {
      // 如果日志记录失败，至少在控制台输出信息，不影响主业务逻辑
      console.error('日志记录失败:', error);
      console.log(`[${level}] ${message}`, { category, data });
    }
  }
}
