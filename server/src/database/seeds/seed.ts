import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

// Import entities
import { Service } from '../../services/entities/service.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';
import { Command } from '../../commands/entities/command.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { SupplierTransaction } from '../../supplier-transactions/entities/supplier-transaction.entity';

// Import seed data
import { servicesSeedData } from './data/services.seed';
import { suppliersSeedData } from './data/suppliers.seed';
import { usersSeedData } from './data/users.seed';
import { commandsSeedData } from './data/commands.seed';
import { paymentsSeedData } from './data/payments.seed';
import { supplierTransactionsSeedData } from './data/supplier-transactions.seed';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function clearDatabase() {
  log('\n🗑️  Clearing database...', 'yellow');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Disable foreign key checks and truncate in order
    await queryRunner.query('TRUNCATE TABLE payments CASCADE');
    await queryRunner.query('TRUNCATE TABLE supplier_transactions CASCADE');
    await queryRunner.query('TRUNCATE TABLE commands CASCADE');
    await queryRunner.query('TRUNCATE TABLE suppliers CASCADE');
    await queryRunner.query('TRUNCATE TABLE services CASCADE');
    // Don't truncate users to keep admin
    await queryRunner.query('DELETE FROM users WHERE role = $1', ['employee']);

    log('✓ Database cleared', 'green');
  } finally {
    await queryRunner.release();
  }
}

async function seedServices(): Promise<Service[]> {
  log('\n📦 Seeding services...', 'blue');

  const serviceRepo = AppDataSource.getRepository(Service);
  const services: Service[] = [];

  for (const serviceData of servicesSeedData) {
    const existing = await serviceRepo.findOne({ where: { name: serviceData.name } });
    if (existing) {
      log(`  ⏭️  Service "${serviceData.name}" already exists`, 'yellow');
      services.push(existing);
    } else {
      const service = serviceRepo.create(serviceData);
      const saved = await serviceRepo.save(service);
      services.push(saved);
      log(`  ✓ Created service: ${serviceData.name}`, 'green');
    }
  }

  return services;
}

async function seedSuppliers(): Promise<Supplier[]> {
  log('\n🏢 Seeding suppliers...', 'blue');

  const supplierRepo = AppDataSource.getRepository(Supplier);
  const suppliers: Supplier[] = [];

  for (const supplierData of suppliersSeedData) {
    const existing = await supplierRepo.findOne({ where: { name: supplierData.name } });
    if (existing) {
      log(`  ⏭️  Supplier "${supplierData.name}" already exists`, 'yellow');
      suppliers.push(existing);
    } else {
      const supplier = supplierRepo.create(supplierData);
      const saved = await supplierRepo.save(supplier);
      suppliers.push(saved);
      log(`  ✓ Created supplier: ${supplierData.name}`, 'green');
    }
  }

  return suppliers;
}

async function seedUsers(): Promise<User[]> {
  log('\n👥 Seeding users...', 'blue');

  const userRepo = AppDataSource.getRepository(User);
  const users: User[] = [];

  for (const userData of usersSeedData) {
    const existing = await userRepo.findOne({ where: { email: userData.email } });
    if (existing) {
      log(`  ⏭️  User "${userData.email}" already exists`, 'yellow');
      users.push(existing);
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = userRepo.create({
        ...userData,
        password: hashedPassword,
      });
      const saved = await userRepo.save(user);
      users.push(saved);
      log(`  ✓ Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`, 'green');
    }
  }

  // Get admin user for createdBy references
  const admin = await userRepo.findOne({ where: { email: 'admin@elhikma.dz' } });
  if (admin) {
    users.unshift(admin); // Add admin at the beginning
  }

  return users;
}

async function seedCommands(
  services: Service[],
  suppliers: Supplier[],
  users: User[],
): Promise<Command[]> {
  log('\n📋 Seeding commands...', 'blue');

  const commandRepo = AppDataSource.getRepository(Command);
  const commands: Command[] = [];
  const adminUser = users[0]; // Admin is first in array

  for (const commandData of commandsSeedData) {
    const service = services[commandData.serviceIndex];
    const supplier = suppliers[commandData.supplierIndex];

    const command = commandRepo.create({
      serviceId: service.id,
      supplierId: supplier.id,
      data: commandData.data as any,
      status: commandData.status as any,
      destination: commandData.destination,
      sellingPrice: commandData.sellingPrice,
      amountPaid: commandData.amountPaid,
      buyingPrice: commandData.buyingPrice,
      createdBy: adminUser.id,
    });

    const saved = await commandRepo.save(command);
    commands.push(saved);
    log(`  ✓ Created command: ${commandData.data.clientFullName} - ${service.name}`, 'green');
  }

  return commands;
}

async function seedPayments(commands: Command[], users: User[]): Promise<void> {
  log('\n💰 Seeding payments...', 'blue');

  const paymentRepo = AppDataSource.getRepository(Payment);
  const adminUser = users[0];

  for (const paymentData of paymentsSeedData) {
    const command = commands[paymentData.commandIndex];

    const payment = paymentRepo.create({
      commandId: command.id,
      amount: paymentData.amount,
      method: paymentData.method,
      notes: paymentData.notes,
      recordedBy: adminUser.id,
    });

    await paymentRepo.save(payment);
    log(`  ✓ Created payment: ${paymentData.amount} DZD for command ${command.id.slice(0, 8)}...`, 'green');
  }
}

async function seedSupplierTransactions(
  suppliers: Supplier[],
  users: User[],
): Promise<void> {
  log('\n🔄 Seeding supplier transactions...', 'blue');

  const transactionRepo = AppDataSource.getRepository(SupplierTransaction);
  const adminUser = users[0];

  for (const txData of supplierTransactionsSeedData) {
    const supplier = suppliers[txData.supplierIndex];
    const date = new Date();
    date.setDate(date.getDate() - txData.daysAgo);

    const transaction = transactionRepo.create({
      supplierId: supplier.id,
      type: txData.type,
      amount: txData.amount,
      note: txData.note,
      date: date,
      recordedBy: adminUser.id,
    });

    await transactionRepo.save(transaction);
    log(`  ✓ Created transaction: ${txData.type} ${txData.amount} DZD - ${supplier.name}`, 'green');
  }
}

async function seedServicesOnly(): Promise<void> {
  log('\n🌱 Seeding services only...', 'cyan');
  await AppDataSource.initialize();

  try {
    await seedServices();
    log('\n✅ Services seeding completed!', 'green');
  } finally {
    await AppDataSource.destroy();
  }
}

async function seed(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const onlyServices = args.includes('--only=services');

  log('\n🌱 Starting database seeding...', 'cyan');
  log(`   Database: ${process.env.DB_DATABASE || 'elhikma'}`, 'cyan');
  log(`   Host: ${process.env.DB_HOST || 'localhost'}`, 'cyan');

  try {
    await AppDataSource.initialize();
    log('✓ Database connected', 'green');

    if (onlyServices) {
      await seedServices();
      log('\n✅ Services seeding completed!', 'green');
      return;
    }

    if (shouldClear) {
      await clearDatabase();
    }

    // Seed in dependency order
    const services = await seedServices();
    const suppliers = await seedSuppliers();
    const users = await seedUsers();
    const commands = await seedCommands(services, suppliers, users);
    await seedPayments(commands, users);
    await seedSupplierTransactions(suppliers, users);

    log('\n✅ Database seeding completed successfully!', 'green');
    log('\n📊 Summary:', 'cyan');
    log(`   • Services: ${services.length}`, 'cyan');
    log(`   • Suppliers: ${suppliers.length}`, 'cyan');
    log(`   • Users: ${users.length - 1} employees (+ admin)`, 'cyan');
    log(`   • Commands: ${commands.length}`, 'cyan');
    log(`   • Payments: ${paymentsSeedData.length}`, 'cyan');
    log(`   • Supplier Transactions: ${supplierTransactionsSeedData.length}`, 'cyan');
  } catch (error) {
    log(`\n❌ Seeding failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
