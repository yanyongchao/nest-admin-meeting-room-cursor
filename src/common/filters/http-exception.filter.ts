import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../dto/response.dto';

/**
 * HTTP异常过滤器
 * 只捕获HttpException类型的异常并转换为标准的ResponseDto格式
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 获取异常状态码
    const status = exception.getStatus();

    // 获取异常响应
    const exceptionResponse = exception.getResponse();

    console.log('exceptionResponse==>', exceptionResponse);

    // 构建错误信息
    let message = '操作失败';

    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      // 处理验证错误的情况
      if (Array.isArray(exceptionResponse.message)) {
        // 取验证错误的第一条
        if (exceptionResponse.message.length > 0) {
          message = exceptionResponse.message[0];
        }
      } else {
        message = exceptionResponse.message as string;
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    // 构建错误代码
    const errorCode =
      typeof exceptionResponse === 'object' && 'errorCode' in exceptionResponse
        ? (exceptionResponse.errorCode as string)
        : `ERR_${status}`;

    // 构建标准响应
    const responseBody: ResponseDto<null> = {
      success: false,
      message: message,
      errorCode: errorCode,
      errorDetails:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              path: request.url,
              timestamp: new Date().toISOString(),
              details: exceptionResponse,
            },
      timestamp: new Date().toISOString(),
    };

    // 发送响应
    response.status(status).json(responseBody);
  }
}
