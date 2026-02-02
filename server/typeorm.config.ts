import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Entity imports
import { User } from './src/users/entities/user.entity';
import { RefreshToken } from './src/auth/entities/refresh-token.entity';
import { Service } from './src/services/entities/service.entity';
import { ServiceType } from './src/service-types/entities/service-type.entity';
import { Supplier } from './src/suppliers/entities/supplier.entity';
import { Command } from './src/commands/entities/command.entity';
import { Payment } from './src/payments/entities/payment.entity';
import { SupplierTransaction } from './src/supplier-transactions/entities/supplier-transaction.entity';
import { Document } from './src/documents/entities/document.entity';
import { OmraHotel } from './src/omra/entities/omra-hotel.entity';
import { OmraOrder } from './src/omra/entities/omra-order.entity';
import { OmraVisa } from './src/omra/entities/omra-visa.entity';
import { EmployeeTransaction } from './src/employee-transactions/entities/employee-transaction.entity';
import { Expense } from './src/expenses/entities/expense.entity';
import { SupplierOrder } from './src/supplier-orders/entities/supplier-order.entity';
import { SupplierReceipt } from './src/supplier-receipts/entities/supplier-receipt.entity';
import { SupplierInvoice } from './src/supplier-invoices/entities/supplier-invoice.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'elhikma',
  entities: [
    User,
    RefreshToken,
    Service,
    ServiceType,
    Supplier,
    Command,
    Payment,
    SupplierTransaction,
    Document,
    OmraHotel,
    OmraOrder,
    OmraVisa,
    EmployeeTransaction,
    Expense,
    SupplierOrder,
    SupplierReceipt,
    SupplierInvoice,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
