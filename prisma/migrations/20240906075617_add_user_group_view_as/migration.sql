-- CreateEnum
CREATE TYPE "ViewAs" AS ENUM ('Public', 'Private');

-- AlterTable
ALTER TABLE "user_group" ADD COLUMN     "view_as" "ViewAs" NOT NULL DEFAULT 'Private';
