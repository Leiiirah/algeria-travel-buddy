import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CommandsModule } from './commands/commands.module';
import { PaymentsModule } from './payments/payments.module';
import { SupplierTransactionsModule } from './supplier-transactions/supplier-transactions.module';
import { DocumentsModule } from './documents/documents.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { OmraModule } from './omra/omra.module';
import { EmployeeTransactionsModule } from './employee-transactions/employee-transactions.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SupplierOrdersModule } from './supplier-orders/supplier-orders.module';
import { SupplierReceiptsModule } from './supplier-receipts/supplier-receipts.module';
import { SupplierInvoicesModule } from './supplier-invoices/supplier-invoices.module';
import { ServiceTypesModule } from './service-types/service-types.module';
import { InternalTasksModule } from './internal-tasks/internal-tasks.module';
import { ClientInvoicesModule } from './client-invoices/client-invoices.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global rate limiting: 100 requests per 60 seconds
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE', 'elhikma'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // NEVER use true in production
        migrationsRun: true, // Auto-run pending migrations on startup
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ServicesModule,
    SuppliersModule,
    CommandsModule,
    PaymentsModule,
    SupplierTransactionsModule,
    DocumentsModule,
    AnalyticsModule,
    SearchModule,
    OmraModule,
    EmployeeTransactionsModule,
    ExpensesModule,
    SupplierOrdersModule,
    SupplierReceiptsModule,
    SupplierInvoicesModule,
    ServiceTypesModule,
    InternalTasksModule,
    ClientInvoicesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}

