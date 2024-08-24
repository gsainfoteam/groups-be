-- DropIndex
DROP INDEX "group_name_key";

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "deleted_at" TIMESTAMP(3);
