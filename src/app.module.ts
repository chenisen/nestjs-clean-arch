import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigModule } from './shared/infrastructure/env-config/env-config.module';
import { UsersModule } from './users/infrastructure/users.module';
import { DatabaseModule } from '@faker-js/faker';
import { PrismaService } from './shared/infrastructure/database/prisma/prisma.service';

@Module({
  imports: [EnvConfigModule.forRoot(), UsersModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
