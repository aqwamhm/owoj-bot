-- DropForeignKey
ALTER TABLE `member` DROP FOREIGN KEY `Member_groupId_fkey`;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
