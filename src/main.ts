import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { seedAdmin } from './config/seed-admin';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const usersService = app.get(UsersService);
  await seedAdmin(usersService);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
