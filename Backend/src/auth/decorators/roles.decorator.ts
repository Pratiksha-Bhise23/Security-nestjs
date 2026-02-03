import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * Use this to restrict access to specific roles
 * 
 * Example:
 * @Roles(Role.Admin)
 * @Get('admin-only')
 * getAdminData() {
 *   ...
 * }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
