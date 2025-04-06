/**
 * 统一响应数据结构
 */
export class ResponseDto<T> {
  success: boolean; // 请求是否成功
  message: string; // 响应信息
  data?: T; // 返回的数据，泛型可以根据不同的接口返回不同的类型
  errorCode?: string; // 错误代码，用于区分不同的错误类型
  errorDetails?: any; // 错误的详细信息
  timestamp: string; // 响应时间戳
}