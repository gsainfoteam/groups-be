-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('Public', 'Private');

-- AlterTable
ALTER TABLE "user_group" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'Private';
