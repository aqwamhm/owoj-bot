-- AlterTable
ALTER TABLE `groups` ADD COLUMN `adminPhoneNumber` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_adminPhoneNumber_fkey` FOREIGN KEY (`adminPhoneNumber`) REFERENCES `admins`(`phoneNumber`) ON DELETE SET NULL ON UPDATE CASCADE;
