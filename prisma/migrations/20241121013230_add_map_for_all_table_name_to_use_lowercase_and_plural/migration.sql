-- Rename the existing tables
RENAME TABLE `Admin` TO `admins`;
RENAME TABLE `Group` TO `groups`;
RENAME TABLE `Member` TO `members`;
RENAME TABLE `Period` TO `periods`;
RENAME TABLE `Report` TO `reports`;

-- Update foreign key constraints with new table names
ALTER TABLE `members`
    ADD CONSTRAINT `members_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reports`
    ADD CONSTRAINT `reports_memberName_memberGroupId_fkey` FOREIGN KEY (`memberName`, `memberGroupId`) REFERENCES `members`(`name`, `groupId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reports`
    ADD CONSTRAINT `reports_periodStartDate_periodEndDate_fkey` FOREIGN KEY (`periodStartDate`, `periodEndDate`) REFERENCES `periods`(`startDate`, `endDate`) ON DELETE RESTRICT ON UPDATE CASCADE;