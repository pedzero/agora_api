-- DropForeignKey
ALTER TABLE `followers` DROP FOREIGN KEY `followers_followerId_fkey`;

-- DropForeignKey
ALTER TABLE `followers` DROP FOREIGN KEY `followers_followingId_fkey`;

-- DropIndex
DROP INDEX `followers_followingId_fkey` ON `followers`;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
