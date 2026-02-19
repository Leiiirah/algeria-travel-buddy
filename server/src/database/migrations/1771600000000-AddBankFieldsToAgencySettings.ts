import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankFieldsToAgencySettings1771600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO agency_settings (id, key, value)
      SELECT uuid_generate_v4(), 'bankName', 'CCP'
      WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'bankName');
    `);

    await queryRunner.query(`
      INSERT INTO agency_settings (id, key, value)
      SELECT uuid_generate_v4(), 'bankAccount', '00799999001499040728'
      WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'bankAccount');
    `);

    await queryRunner.query(`
      INSERT INTO agency_settings (id, key, value)
      SELECT uuid_generate_v4(), 'mobilePhone', '0540 40 00 80'
      WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'mobilePhone');
    `);

    await queryRunner.query(`
      INSERT INTO agency_settings (id, key, value)
      SELECT uuid_generate_v4(), 'licenseNumber', '1500'
      WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'licenseNumber');
    `);

    await queryRunner.query(`
      INSERT INTO agency_settings (id, key, value)
      SELECT uuid_generate_v4(), 'articleFiscal', '00120908076'
      WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'articleFiscal');
    `);

    await queryRunner.query(`
      INSERT INTO agency_settings (id, key, value)
      SELECT uuid_generate_v4(), 'arabicName', 'الحكمة للسياحة و الاسفار'
      WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'arabicName');
    `);

    await queryRunner.query(`
      INSERT INTO agency_settings (id, key, value)
      SELECT uuid_generate_v4(), 'arabicAddress', '02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر'
      WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'arabicAddress');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM agency_settings WHERE key IN ('bankName', 'bankAccount', 'mobilePhone', 'licenseNumber', 'articleFiscal', 'arabicName', 'arabicAddress');`);
  }
}
