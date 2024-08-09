-- CreateEnum
CREATE TYPE "Grant" AS ENUM ('APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "Authority" AS ENUM ('MEMBER_UPDATE', 'MEMBER_DELETE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_GRANT', 'ROLE_REVOKE', 'GROUP_UPDATE', 'GROUP_DELETE');

-- CreateTable
CREATE TABLE "client" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "grant" "Grant" NOT NULL DEFAULT 'REJECT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "client_authority" (
    "client_uuid" UUID NOT NULL,
    "authority" TEXT NOT NULL,

    CONSTRAINT "client_authority_pkey" PRIMARY KEY ("client_uuid","authority")
);

-- CreateTable
CREATE TABLE "role_authority" (
    "role_id" INTEGER NOT NULL,
    "role_group_uuid" UUID NOT NULL,
    "client_uuid" UUID NOT NULL,
    "authority" TEXT NOT NULL,

    CONSTRAINT "role_authority_pkey" PRIMARY KEY ("role_id","role_group_uuid","client_uuid","authority")
);

-- CreateTable
CREATE TABLE "user" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "group" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "president_uuid" UUID NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_group" (
    "user_uuid" UUID NOT NULL,
    "group_uuid" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_group_pkey" PRIMARY KEY ("user_uuid","group_uuid")
);

-- CreateTable
CREATE TABLE "role" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "group_uuid" UUID NOT NULL,
    "authorities" "Authority"[],

    CONSTRAINT "role_pkey" PRIMARY KEY ("id","group_uuid")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_uuid" UUID NOT NULL,
    "group_uuid" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_uuid","group_uuid","role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_name_key" ON "client"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "group_name_key" ON "group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_group_uuid_key" ON "role"("name", "group_uuid");

-- AddForeignKey
ALTER TABLE "client_authority" ADD CONSTRAINT "client_authority_client_uuid_fkey" FOREIGN KEY ("client_uuid") REFERENCES "client"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_authority" ADD CONSTRAINT "role_authority_role_id_role_group_uuid_fkey" FOREIGN KEY ("role_id", "role_group_uuid") REFERENCES "role"("id", "group_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_authority" ADD CONSTRAINT "role_authority_client_uuid_authority_fkey" FOREIGN KEY ("client_uuid", "authority") REFERENCES "client_authority"("client_uuid", "authority") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_president_uuid_fkey" FOREIGN KEY ("president_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_uuid_fkey" FOREIGN KEY ("group_uuid") REFERENCES "group"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_group_uuid_fkey" FOREIGN KEY ("group_uuid") REFERENCES "group"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_group_uuid_fkey" FOREIGN KEY ("group_uuid") REFERENCES "group"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_group_uuid_fkey" FOREIGN KEY ("role_id", "group_uuid") REFERENCES "role"("id", "group_uuid") ON DELETE CASCADE ON UPDATE CASCADE;
