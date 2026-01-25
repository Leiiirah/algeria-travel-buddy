import { UserRole } from '../../../users/entities/user.entity';

export const usersSeedData = [
  {
    email: 'sarah@elhikma.dz',
    password: 'Employee@123',
    firstName: 'Sarah',
    lastName: 'Meziane',
    role: UserRole.EMPLOYEE,
    isActive: true,
  },
  {
    email: 'karim@elhikma.dz',
    password: 'Employee@123',
    firstName: 'Karim',
    lastName: 'Hadj',
    role: UserRole.EMPLOYEE,
    isActive: true,
  },
];
