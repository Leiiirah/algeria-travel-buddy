import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddOmraPrograms1770900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create omra_programs table
    await queryRunner.createTable(
      new Table({
        name: 'omra_programs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'periodFrom',
            type: 'date',
          },
          {
            name: 'periodTo',
            type: 'date',
          },
          {
            name: 'totalPlaces',
            type: 'int',
          },
          {
            name: 'hotelId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'pricing',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdBy',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key to omra_hotels
    await queryRunner.createForeignKey(
      'omra_programs',
      new TableForeignKey({
        columnNames: ['hotelId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'omra_hotels',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign key to users
    await queryRunner.createForeignKey(
      'omra_programs',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Update omra_orders.programId FK: drop old FK to omra_hotels, add new FK to omra_programs
    // First check if a foreign key exists on programId pointing to omra_hotels
    const table = await queryRunner.getTable('omra_orders');
    if (table) {
      const existingFK = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('programId') !== -1,
      );
      if (existingFK) {
        await queryRunner.dropForeignKey('omra_orders', existingFK);
      }
    }

    // Add new FK from omra_orders.programId to omra_programs
    await queryRunner.createForeignKey(
      'omra_orders',
      new TableForeignKey({
        columnNames: ['programId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'omra_programs',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK from omra_orders.programId to omra_programs
    const ordersTable = await queryRunner.getTable('omra_orders');
    if (ordersTable) {
      const fk = ordersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('programId') !== -1,
      );
      if (fk) {
        await queryRunner.dropForeignKey('omra_orders', fk);
      }
    }

    // Restore old FK from omra_orders.programId to omra_hotels
    await queryRunner.createForeignKey(
      'omra_orders',
      new TableForeignKey({
        columnNames: ['programId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'omra_hotels',
        onDelete: 'SET NULL',
      }),
    );

    // Drop omra_programs table (FKs will be dropped automatically)
    await queryRunner.dropTable('omra_programs', true);
  }
}
