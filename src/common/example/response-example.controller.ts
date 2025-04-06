import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ResponseUtil } from '../utils/response.util';

/**
 * 响应示例控制器
 * 仅用于演示响应拦截器和工具类的使用
 */
@Controller('example')
export class ResponseExampleController {
  /**
   * 返回普通数据，将被拦截器转换为标准格式
   */
  @Get('simple')
  getSimpleResponse() {
    return { name: '张三', age: 30 };
  }
  
  /**
   * 使用ResponseUtil手动创建标准响应
   */
  @Get('manual')
  getManualResponse() {
    const data = { name: '李四', age: 25 };
    return ResponseUtil.success(data, '获取数据成功');
  }
  
  /**
   * 创建分页响应
   */
  @Get('page')
  getPageResponse() {
    const list = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' },
    ];
    
    return ResponseUtil.page(list, 100, 1, 10);
  }
  
  /**
   * 抛出异常，将被异常过滤器捕获并转换为标准格式
   */
  @Get('error')
  getErrorResponse() {
    throw new HttpException('数据获取失败', HttpStatus.BAD_REQUEST);
  }
  
  /**
   * 自定义错误代码的异常
   */
  @Get('custom-error')
  getCustomErrorResponse() {
    throw new HttpException(
      {
        message: '用户认证失败',
        errorCode: 'AUTH_FAILED',
      },
      HttpStatus.UNAUTHORIZED
    );
  }
  
  /**
   * 手动创建错误响应
   */
  @Get('manual-error')
  getManualErrorResponse() {
    return ResponseUtil.error('手动创建的错误响应', 'MANUAL_ERROR');
  }
}