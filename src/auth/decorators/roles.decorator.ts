/* Custom decorator to set roles on a route. */

//src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/common/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
