// ConfigModule.forRoot({ isGlobal: true }) → we can read env anywhere
// DatabaseModule → connects to MongoDB

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    DatabaseModule, UsersModule, AuthModule,                           // connects MongoDB
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
