import { Module } from '@nestjs/common';
import { ResponseExampleController } from './response-example.controller';

@Module({
  controllers: [ResponseExampleController],
})
export class ExampleModule {}