// forRootAsync → allows dynamic config from .env
// Uses ConfigService to read .env

// src/config/database.config.ts
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const DatabaseModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_URI'),
  }),
});


