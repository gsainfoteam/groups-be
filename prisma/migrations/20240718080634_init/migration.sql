-- CreateEnum
CREATE TYPE "Authority" AS ENUM ('MEMBER_UPDATE', 'MEMBER_DELETE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'GROUP_UPDATE', 'GROUP_DELETE');

-- CreateTable
CREATE TABLE "user" (
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "group" (
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "president_uuid" UUID NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "user_group" (
    "user_uuid" UUID NOT NULL,
    "group_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_group_pkey" PRIMARY KEY ("user_uuid","group_name")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "authorities" "Authority"[],
    "external_authorities" TEXT[],

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id","group_name")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_uuid" UUID NOT NULL,
    "group_name" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_uuid","group_name")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_group_name_key" ON "Role"("name", "group_name");

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_president_uuid_fkey" FOREIGN KEY ("president_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_group_name_fkey" FOREIGN KEY ("role_id", "group_name") REFERENCES "Role"("id", "group_name") ON DELETE CASCADE ON UPDATE CASCADE;
