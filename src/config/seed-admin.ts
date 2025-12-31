/**We need one admin account (sanjeevan) on server start. */

// src/config/seed-admin.ts
import { Role } from 'src/common/roles.enum';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(usersService: UsersService) {
  const adminExists = await usersService.findByLogin('sanjeevan');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Pass@1234', 10);
    await usersService.create({
      email: 'sanjeevan@admin.com',
      username: 'sanjeevan',
      password: hashedPassword,
      role: Role.ADMIN,
      firstname: 'Admin',
      lastname: 'User',
    });
    console.log('Admin account created: username=sanjeevan, password=Pass@1234');
  }
}
