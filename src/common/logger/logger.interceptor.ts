import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LogLevel } from './logger.constants';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = request.user?.id || 'anonymous';

    const now = Date.now();
    const requestId = `${now}-${Math.random().toString(36).substring(2, 10)}`;

    // 记录请求信息 - 使用正确的格式记录日志
    const requestLogData = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: `请求信息: ${method} ${url}`,
      requestId,
      method,
      url,
      body,
      ip,
      userAgent,
      userId,
    };

    // 确保日志正确写入
    this.logger.log(requestLogData);
    console.log('请求拦截器工作中 =>', method, url);

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          // 记录响应信息 - 成功
          const responseTime = Date.now() - now;
          const responseLogData = {
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            message: `响应信息: ${method} ${url} ${responseTime}ms`,
            requestId,
            method,
            url,
            responseTime: `${responseTime}ms`,
            status: context.switchToHttp().getResponse().statusCode,
            response: data,
          };

          // 确保日志正确写入
          this.logger.log(responseLogData);
          console.log('响应拦截器成功 =>', method, url, responseTime + 'ms');
        },
        error: (err: any) => {
          // 记录响应信息 - 错误
          const responseTime = Date.now() - now;
          const errorLogData = {
            level: LogLevel.ERROR,
            message: `请求错误: ${method} ${url} ${err.message}`,
            requestId,
            method,
            url,
            responseTime: `${responseTime}ms`,
            error: {
              name: err.name,
              message: err.message,
              stack: err.stack,
            },
            timestamp: new Date().toISOString(),
          };

          // 确保错误日志正确写入
          this.logger.error(errorLogData);
          console.error('响应拦截器错误 =>', method, url, err.message);
        },
      }),
    );
  }
}
