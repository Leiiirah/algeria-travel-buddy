import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddCaisseHistory1771000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'caisse_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'employeeId',
            type: 'uuid',
          },
          {
            name: 'caisseAmount',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'impayesAmount',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'beneficesAmount',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'commandCount',
            type: 'int',
          },
          {
            name: 'newBalance',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'adminId',
            type: 'uuid',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'resetDate',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'caisse_history',
      new TableForeignKey({
        columnNames: ['employeeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'caisse_history',
      new TableForeignKey({
        columnNames: ['adminId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('caisse_history');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('caisse_history', fk);
      }
    }
    await queryRunner.dropTable('caisse_history', true);
  }
}
