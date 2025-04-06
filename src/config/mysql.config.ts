import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs('database', (): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [join(__dirname, '../../entities/**/*.entity{.ts,.js}')],
    synchronize: process.env.NODE_ENV !== 'production', // 非生产环境自动同步数据库结构
    logging: process.env.NODE_ENV !== 'production',
    charset: 'utf8mb4',
    timezone: '+08:00', // 中国时区
    autoLoadEntities: true,
  };
});