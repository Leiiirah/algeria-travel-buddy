import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSync1770032186745 implements MigrationInterface {
    name = 'InitialSync1770032186745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commands" ALTER COLUMN "status" SET DEFAULT 'dossier_incomplet'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commands" ALTER COLUMN "status" DROP DEFAULT`);
    }

}
