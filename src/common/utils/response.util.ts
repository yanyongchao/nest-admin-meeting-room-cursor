import { ResponseDto } from '../dto/response.dto';

/**
 * 响应工具类
 * 用于创建标准的响应对象
 */
export class ResponseUtil {
  /**
   * 创建成功响应
   */
  static success<T>(data?: T, message: string = '操作成功'): ResponseDto<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建失败响应
   */
  static error<T>(
    message: string = '操作失败',
    errorCode?: string,
    errorDetails?: any
  ): ResponseDto<T> {
    return {
      success: false,
      message,
      errorCode,
      errorDetails,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建分页响应
   */
  static page<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): ResponseDto<{ list: T[]; total: number; page: number; pageSize: number }> {
    return {
      success: true,
      message,
      data: {
        list,
        total,
        page,
        pageSize,
      },
      timestamp: new Date().toISOString(),
    };
  }
}