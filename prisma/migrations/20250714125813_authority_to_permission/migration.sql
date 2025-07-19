/*
  Warnings:

  - You are about to drop the column `authorities` on the `role` table. All the data in the column will be lost.
  - You are about to drop the `client_authority` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_authority` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MEMBER_UPDATE', 'MEMBER_DELETE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_GRANT', 'ROLE_REVOKE', 'GROUP_UPDATE', 'GROUP_DELETE');

-- DropForeignKey
ALTER TABLE "client_authority" DROP CONSTRAINT "client_authority_client_uuid_fkey";

-- DropForeignKey
ALTER TABLE "role_authority" DROP CONSTRAINT "role_authority_client_uuid_authority_fkey";

-- DropForeignKey
ALTER TABLE "role_authority" DROP CONSTRAINT "role_authority_role_id_role_group_uuid_fkey";

-- AlterTable
ALTER TABLE "role" DROP COLUMN "authorities",
ADD COLUMN     "permissions" "Permission"[];

-- DropTable
DROP TABLE "client_authority";

-- DropTable
DROP TABLE "role_authority";

-- DropEnum
DROP TYPE "Authority";

-- CreateTable
CREATE TABLE "client_permission" (
    "client_uuid" UUID NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "client_permission_pkey" PRIMARY KEY ("client_uuid","permission")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" INTEGER NOT NULL,
    "role_group_uuid" UUID NOT NULL,
    "client_uuid" UUID NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","role_group_uuid","client_uuid","permission")
);

-- AddForeignKey
ALTER TABLE "client_permission" ADD CONSTRAINT "client_permission_client_uuid_fkey" FOREIGN KEY ("client_uuid") REFERENCES "client"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_group_uuid_fkey" FOREIGN KEY ("role_id", "role_group_uuid") REFERENCES "role"("id", "group_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_client_uuid_permission_fkey" FOREIGN KEY ("client_uuid", "permission") REFERENCES "client_permission"("client_uuid", "permission") ON DELETE RESTRICT ON UPDATE CASCADE;
