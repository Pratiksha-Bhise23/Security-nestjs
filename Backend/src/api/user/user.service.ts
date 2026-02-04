import { Injectable, UnauthorizedException } from '@nestjs/common';
import { pool } from '../../config/database.config';

@Injectable()
export class UserService {
  async getProfile(email: string) {
    if (!email) {
      throw new UnauthorizedException('Email not provided');
    }

    const result = await pool.query(
      'SELECT id, email, role, is_verified, created_at FROM users WHERE email = $1',
      [email],
    );

    if (!result.rows.length) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      user: result.rows[0],
    };
  }

  async updateProfile(email: string, updateData: any) {
    if (!email) {
      throw new UnauthorizedException('Email not provided');
    }

    const allowedFields = ['first_name', 'last_name', 'phone'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return { success: false, message: 'No valid fields to update' };
    }

    updates.push(`updated_at = NOW()`);
    values.push(email);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE email = $${paramIndex}
      RETURNING id, email, role, is_verified, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (!result.rows.length) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0],
    };
  }

  async updateEmailProfile(email: string, newEmail: string) {
    if (!email) {
      throw new UnauthorizedException('Email not provided');
    }

    if (!newEmail) {
      return { success: false, message: 'New email is required' };
    }

    // Check if new email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [newEmail],
    );

    if (existingUser.rows.length > 0) {
      return { success: false, message: 'Email already in use' };
    }

    const result = await pool.query(
      `UPDATE users 
       SET email = $1, updated_at = NOW()
       WHERE email = $2
       RETURNING id, email, role, is_verified, created_at, updated_at`,
      [newEmail, email],
    );

    if (!result.rows.length) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      message: 'Email updated successfully',
      user: result.rows[0],
    };
  }
}
