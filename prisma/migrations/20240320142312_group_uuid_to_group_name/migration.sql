/*
  Warnings:

  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `group_uuid` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `group` table. All the data in the column will be lost.
  - The primary key for the `user_group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `group_uuid` on the `user_group` table. All the data in the column will be lost.
  - The primary key for the `user_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `group_uuid` on the `user_role` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,group_name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_name` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_name` to the `user_group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_name` to the `user_role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_group_uuid_fkey";

-- DropForeignKey
ALTER TABLE "user_group" DROP CONSTRAINT "user_group_group_uuid_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_group_uuid_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_role_id_group_uuid_fkey";

-- DropIndex
DROP INDEX "Role_name_group_uuid_key";

-- DropIndex
DROP INDEX "group_name_key";

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "group_uuid",
ADD COLUMN     "group_name" TEXT NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id", "group_name");

-- AlterTable
ALTER TABLE "group" DROP CONSTRAINT "group_pkey",
DROP COLUMN "uuid",
ADD CONSTRAINT "group_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "user_group" DROP CONSTRAINT "user_group_pkey",
DROP COLUMN "group_uuid",
ADD COLUMN     "group_name" TEXT NOT NULL,
ADD CONSTRAINT "user_group_pkey" PRIMARY KEY ("user_uuid", "group_name");

-- AlterTable
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_pkey",
DROP COLUMN "group_uuid",
ADD COLUMN     "group_name" TEXT NOT NULL,
ADD CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_uuid", "group_name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_group_name_key" ON "Role"("name", "group_name");

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_group_name_fkey" FOREIGN KEY ("role_id", "group_name") REFERENCES "Role"("id", "group_name") ON DELETE RESTRICT ON UPDATE CASCADE;
