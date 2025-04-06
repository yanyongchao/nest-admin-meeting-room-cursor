import { ConfigModuleOptions } from '@nestjs/config';
import * as path from 'path';

export const envConfig: ConfigModuleOptions = {
  envFilePath: [
    path.resolve(process.cwd(), `.${process.env.NODE_ENV || 'dev'}.env`),
  ],
  // 保证验证配置的完整性
  validationOptions: {
    allowUnknown: true,
    abortEarly: true,
  },
};
