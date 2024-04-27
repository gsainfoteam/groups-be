-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_group_name_fkey";

-- DropForeignKey
ALTER TABLE "user_group" DROP CONSTRAINT "user_group_group_name_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_group_name_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_role_id_group_name_fkey";

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "group"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_group_name_fkey" FOREIGN KEY ("role_id", "group_name") REFERENCES "Role"("id", "group_name") ON DELETE CASCADE ON UPDATE CASCADE;
