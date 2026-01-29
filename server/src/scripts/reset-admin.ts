
import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function resetAdmin() {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();

        const userRepo = AppDataSource.getRepository(User);
        const email = 'admin@elhikma.dz';
        const password = 'Admin@123';

        console.log(`Searching for user: ${email}`);
        let user = await userRepo.findOne({ where: { email } });

        if (!user) {
            console.log('User not found. Creating new admin user...');
            user = userRepo.create({
                email,
                firstName: 'Admin',
                lastName: 'System',
                role: UserRole.ADMIN,
                isActive: true,
                // Password will be set below
                password: '',
            });
        } else {
            console.log('User found. Resetting password...');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isActive = true;
        user.role = UserRole.ADMIN; // Ensure role is admin

        await userRepo.save(user);
        console.log(`✅ Admin password reset to: ${password}`);

    } catch (error) {
        console.error('Error resetting admin:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

resetAdmin();
