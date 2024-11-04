/*
  Warnings:

  - A unique constraint covering the columns `[memberName,memberGroupId,pages,totalPages,type,periodStartDate,periodEndDate]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- Drop the foreign key constraint
ALTER TABLE `Report`
DROP FOREIGN KEY `Report_memberName_memberGroupId_fkey`;

-- Drop the old unique index
DROP INDEX `Report_memberName_memberGroupId_pages_periodStartDate_period_key` ON `Report`;

-- Create the new unique index
CREATE UNIQUE INDEX `Report_memberName_memberGroupId_pages_totalPages_type_period_key` 
ON `Report`(`memberName`, `memberGroupId`, `pages`, `totalPages`, `type`, `periodStartDate`, `periodEndDate`);

-- Re-add the foreign key constraint (if necessary)
ALTER TABLE `Report` 
ADD CONSTRAINT `Report_memberName_memberGroupId_fkey` 
FOREIGN KEY (`memberName`, `memberGroupId`) 
REFERENCES `Member`(`name`, `groupId`) ON DELETE CASCADE ON UPDATE CASCADE;
