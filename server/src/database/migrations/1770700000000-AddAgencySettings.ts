import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddAgencySettings1770700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'agency_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'value',
            type: 'text',
            default: "''",
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

    // Seed default values
    const defaults = [
      ['legalName', 'EL HIKMA TOURISME ET VOYAGE'],
      ['address', '02 rue de kolea zaban blida .09001'],
      ['phone', '020475949'],
      ['email', 'elhikmatours@gmail.com'],
      ['nif', '001209080768687'],
      ['nis', '001209010018958'],
      ['rc', '09/00-0807686B12'],
    ];

    for (const [key, value] of defaults) {
      await queryRunner.query(
        `INSERT INTO agency_settings (id, key, value) VALUES (uuid_generate_v4(), $1, $2)`,
        [key, value],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('agency_settings');
  }
}
