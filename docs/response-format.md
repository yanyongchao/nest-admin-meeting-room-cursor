# 统一响应格式文档

## 响应格式说明

为了保持API返回格式的一致性，系统采用了统一的响应拦截器，所有API接口都会返回以下格式的数据：

```typescript
{
  success: boolean;         // 请求是否成功
  message: string;          // 响应信息
  data?: any;               // 返回的数据，可选
  errorCode?: string;       // 错误代码，可选
  errorDetails?: any;       // 错误的详细信息，可选
  timestamp: string;        // 响应时间戳
}
```

## 成功响应示例

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "timestamp": "2023-07-10T08:30:45.123Z"
}
```

## 错误响应示例

```json
{
  "success": false,
  "message": "用户名或密码错误",
  "errorCode": "AUTH_FAILED",
  "errorDetails": {
    "path": "/api/login",
    "timestamp": "2023-07-10T08:30:45.123Z"
  },
  "timestamp": "2023-07-10T08:30:45.123Z"
}
```

## 分页数据响应示例

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "list": [
      { "id": 1, "name": "张三" },
      { "id": 2, "name": "李四" }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": "2023-07-10T08:30:45.123Z"
}
```

## 使用方式

### 控制器直接返回数据（自动转换）

```typescript
@Get('users/:id')
async getUser(@Param('id') id: number) {
  const user = await this.userService.findById(id);
  return user; // 会被自动转换为标准响应格式
}
```

### 使用ResponseUtil手动创建响应

```typescript
import { ResponseUtil } from '@common/utils';

@Get('users/:id')
async getUser(@Param('id') id: number) {
  const user = await this.userService.findById(id);
  return ResponseUtil.success(user, '获取用户成功');
}
```

### 错误处理

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto) {
  try {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      return ResponseUtil.error('用户名或密码错误', 'AUTH_FAILED');
    }
    return ResponseUtil.success(user, '登录成功');
  } catch (error) {
    // 异常会被HttpExceptionFilter捕获并转换为标准响应格式
    throw new HttpException('登录失败', HttpStatus.BAD_REQUEST);
  }
}
```

### 分页数据

```typescript
@Get('users')
async getUsers(@Query() query: { page: number, pageSize: number }) {
  const { page, pageSize } = query;
  const [users, total] = await this.userService.findAll(page, pageSize);
  return ResponseUtil.page(users, total, page, pageSize);
}
```

## 状态码说明

| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 常见错误代码

| 错误代码 | 说明 |
|---------|------|
| AUTH_FAILED | 认证失败 |
| PARAM_ERROR | 参数错误 |
| RESOURCE_NOT_FOUND | 资源不存在 |
| PERMISSION_DENIED | 权限不足 |
| SYSTEM_ERROR | 系统错误 |