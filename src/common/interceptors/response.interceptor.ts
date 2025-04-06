import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

/**
 * 响应拦截器
 * 用于统一处理接口返回的数据格式
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    // 处理响应
    return next.handle().pipe(
      map((data) => {
        // 如果返回的数据已经是 ResponseDto 格式，则直接返回
        if (this.isResponseDto(data)) {
          return data;
        }

        // 从控制器返回的数据中提取消息（如果有）
        let resultData = data;
        let message = '操作成功';

        // 检查返回的数据是否包含message字段
        if (data && typeof data === 'object') {
          if ('message' in data && typeof data.message === 'string') {
            message = data.message;

            // 如果同时存在data字段，则提取作为实际数据
            if ('data' in data) {
              resultData = data.data;
            }
          }
        }

        // 构建标准响应对象
        const response: ResponseDto<T> = {
          success: true,
          message: message,
          data: resultData,
          timestamp: new Date().toISOString(),
        };

        return response;
      }),
    );
  }

  /**
   * 判断是否已经是 ResponseDto 格式
   */
  private isResponseDto(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'message' in data &&
      'timestamp' in data
    );
  }
}
