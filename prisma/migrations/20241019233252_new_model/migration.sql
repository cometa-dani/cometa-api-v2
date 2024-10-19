/*
  Warnings:

  - You are about to drop the column `chat_group_photo_id` on the `ChatGroup` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `EventPhoto` table. All the data in the column will be lost.
  - You are about to drop the column `chat_uuid` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `access_token` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `media_url` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `diet` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `religion` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `UserPhoto` table. All the data in the column will be lost.
  - You are about to drop the `ChatGroupPhoto` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `message` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatGroup" DROP CONSTRAINT "ChatGroup_chat_group_photo_id_fkey";

-- DropIndex
DROP INDEX "Friendship_chat_uuid_key";

-- AlterTable
ALTER TABLE "ChatGroup" DROP COLUMN "chat_group_photo_id",
ADD COLUMN     "avatar_url" TEXT;

-- AlterTable
ALTER TABLE "EventPhoto" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "chat_uuid";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "content",
ADD COLUMN     "message" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "access_token",
DROP COLUMN "media_url",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
DROP COLUMN "diet",
DROP COLUMN "religion";

-- AlterTable
ALTER TABLE "UserPhoto" DROP COLUMN "uuid";

-- DropTable
DROP TABLE "ChatGroupPhoto";
