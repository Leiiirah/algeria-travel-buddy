import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorDocumentsToHierarchy1770600000000 implements MigrationInterface {
  name = 'RefactorDocumentsToHierarchy1770600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the node type enum
    await queryRunner.query(`
      CREATE TYPE "documents_type_enum" AS ENUM ('folder', 'file')
    `);

    // 2. Add new columns
    await queryRunner.query(`
      ALTER TABLE "documents"
        ADD COLUMN "type" "documents_type_enum" NOT NULL DEFAULT 'file',
        ADD COLUMN "parentId" uuid
    `);

    // 3. Make fileUrl nullable (folders don't have files)
    await queryRunner.query(`
      ALTER TABLE "documents" ALTER COLUMN "fileUrl" DROP NOT NULL
    `);

    // 4. Add self-referencing FK
    await queryRunner.query(`
      ALTER TABLE "documents"
        ADD CONSTRAINT "FK_documents_parent"
        FOREIGN KEY ("parentId") REFERENCES "documents"("id") ON DELETE CASCADE
    `);

    // 5. Create index on parentId
    await queryRunner.query(`
      CREATE INDEX "IDX_documents_parentId" ON "documents" ("parentId")
    `);

    // 6. Make category nullable BEFORE inserting folders (category still exists at this point)
    const hasCategory = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'documents' AND column_name = 'category'
    `);
    if (hasCategory.length > 0) {
      await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "category" DROP NOT NULL`);
    }

    // 7. Insert system folders at root level using a known admin user
    const adminUser = await queryRunner.query(`
      SELECT id FROM "users" WHERE role = 'admin' LIMIT 1
    `);
    const adminId = adminUser.length > 0 ? adminUser[0].id : null;

    if (adminId) {
      // Insert the 4 system folders
      await queryRunner.query(`
        INSERT INTO "documents" (id, name, type, "parentId", "fileUrl", "uploadedBy")
        VALUES
          (gen_random_uuid(), 'Assurance', 'folder', NULL, NULL, $1),
          (gen_random_uuid(), 'CNAS', 'folder', NULL, NULL, $1),
          (gen_random_uuid(), 'CASNOS', 'folder', NULL, NULL, $1),
          (gen_random_uuid(), 'Autre', 'folder', NULL, NULL, $1)
      `, [adminId]);

      // 7. Migrate existing files: set parentId based on their category
      // Move 'assurance' files into Assurance folder
      await queryRunner.query(`
        UPDATE "documents" SET "parentId" = (
          SELECT id FROM "documents" WHERE name = 'Assurance' AND type = 'folder' AND "parentId" IS NULL LIMIT 1
        )
        WHERE type = 'file' AND category = 'assurance'
      `);

      await queryRunner.query(`
        UPDATE "documents" SET "parentId" = (
          SELECT id FROM "documents" WHERE name = 'CNAS' AND type = 'folder' AND "parentId" IS NULL LIMIT 1
        )
        WHERE type = 'file' AND category = 'cnas'
      `);

      await queryRunner.query(`
        UPDATE "documents" SET "parentId" = (
          SELECT id FROM "documents" WHERE name = 'CASNOS' AND type = 'folder' AND "parentId" IS NULL LIMIT 1
        )
        WHERE type = 'file' AND category = 'casnos'
      `);

      await queryRunner.query(`
        UPDATE "documents" SET "parentId" = (
          SELECT id FROM "documents" WHERE name = 'Autre' AND type = 'folder' AND "parentId" IS NULL LIMIT 1
        )
        WHERE type = 'file' AND category = 'autre'
      `);
    }

    // 8. Drop the category column and its enum
    // Check if column exists before dropping
    const hasCategory = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'documents' AND column_name = 'category'
    `);

    if (hasCategory.length > 0) {
      await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "category"`);
    }

    // Drop the old category enum if it exists
    await queryRunner.query(`DROP TYPE IF EXISTS "documents_category_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate category enum
    await queryRunner.query(`
      CREATE TYPE "documents_category_enum" AS ENUM ('assurance', 'cnas', 'casnos', 'autre')
    `);

    // Add category column back
    await queryRunner.query(`
      ALTER TABLE "documents" ADD COLUMN "category" "documents_category_enum" DEFAULT 'autre'
    `);

    // Remove system folders and any nested folders
    await queryRunner.query(`DELETE FROM "documents" WHERE type = 'folder'`);

    // Drop parentId FK and column
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "FK_documents_parent"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_parentId"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "parentId"`);

    // Drop type column and enum
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "documents_type_enum"`);

    // Make fileUrl required again
    await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "fileUrl" SET NOT NULL`);
  }
}
