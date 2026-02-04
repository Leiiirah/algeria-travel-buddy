import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class EnsureAdminUser1770200000000 implements MigrationInterface {
  name = 'EnsureAdminUser1770200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = 'admin@elhikma.dz';
    const adminPassword = 'Admin@123';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin user exists
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      [adminEmail]
    );
    
    if (existingAdmin && existingAdmin.length > 0) {
      // Update existing admin user's password and ensure they're active with admin role
      await queryRunner.query(
        `UPDATE users 
         SET password = $1, role = 'admin', "isActive" = true, "updatedAt" = NOW()
         WHERE email = $2`,
        [hashedPassword, adminEmail]
      );
      console.log('✅ Admin user password reset successfully');
    } else {
      // Create new admin user
      await queryRunner.query(
        `INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, 'Admin', 'System', 'admin', true, NOW(), NOW())`,
        [adminEmail, hashedPassword]
      );
      console.log('✅ Admin user created successfully');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Don't delete admin user on rollback - just log
    console.log('Note: Admin user was not modified in rollback');
  }
}
