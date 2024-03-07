-- CreateEnum
CREATE TYPE "Authoity" AS ENUM ('ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'GROUP_UPDATE', 'GROUP_DELETE');

-- CreateTable
CREATE TABLE "user" (
    "uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "group" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_group" (
    "user_uuid" TEXT NOT NULL,
    "group_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_group_pkey" PRIMARY KEY ("user_uuid","group_uuid")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "group_uuid" TEXT NOT NULL,
    "authoities" "Authoity"[],
    "external_authoities" TEXT[],

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id","group_uuid")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_uuid" TEXT NOT NULL,
    "group_uuid" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_uuid","group_uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_name_key" ON "group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_group_uuid_key" ON "Role"("name", "group_uuid");

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_uuid_fkey" FOREIGN KEY ("group_uuid") REFERENCES "group"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_group_uuid_fkey" FOREIGN KEY ("group_uuid") REFERENCES "group"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_group_uuid_fkey" FOREIGN KEY ("group_uuid") REFERENCES "group"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_group_uuid_fkey" FOREIGN KEY ("role_id", "group_uuid") REFERENCES "Role"("id", "group_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
