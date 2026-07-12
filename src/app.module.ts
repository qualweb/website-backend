import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { VersionController } from './version.controller';

@Module({
  imports: [],
  controllers: [AppController, VersionController],
  providers: [AppService],
})
export class AppModule {}
