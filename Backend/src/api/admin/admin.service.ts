import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { pool } from '../../config/database.config';

@Injectable()
export class AdminService {
  /**
   * Get dashboard statistics
   * Accessible only to admins
   */
  async getDashboardStats() {
    try {
      const totalUsersResult = await pool.query(
        'SELECT COUNT(*) as total FROM users',
      );

      const verifiedUsersResult = await pool.query(
        'SELECT COUNT(*) as total FROM users WHERE is_verified = true',
      );

      const adminUsersResult = await pool.query(
        'SELECT COUNT(*) as total FROM users WHERE role = $1',
        ['admin'],
      );

      const recentUsersResult = await pool.query(
        'SELECT id, email, role, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT 10',
      );

      return {
        success: true,
        stats: {
          totalUsers: parseInt(totalUsersResult.rows[0].total),
          verifiedUsers: parseInt(verifiedUsersResult.rows[0].total),
          adminUsers: parseInt(adminUsersResult.rows[0].total),
          recentUsers: recentUsersResult.rows,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;

      const usersResult = await pool.query(
        'SELECT id, email, role, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset],
      );

      const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
      const total = parseInt(countResult.rows[0].total);

      return {
        success: true,
        data: usersResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: number, newRole: 'user' | 'admin') {
    if (!['user', 'admin'].includes(newRole)) {
      throw new BadRequestException('Invalid role');
    }

    try {
      const result = await pool.query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role, is_verified, created_at',
        [newRole, userId],
      );

      if (!result.rows.length) {
        throw new UnauthorizedException('User not found');
      }

      return {
        success: true,
        message: `User role updated to ${newRole}`,
        user: result.rows[0],
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('Failed to update user role');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: number) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, email',
        [userId],
      );

      if (!result.rows.length) {
        throw new UnauthorizedException('User not found');
      }

      return {
        success: true,
        message: 'User deleted successfully',
        user: result.rows[0],
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('Failed to delete user');
    }
  }
}
