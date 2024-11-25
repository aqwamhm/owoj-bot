-- Drop the duplicate constraints in the `members` table
ALTER TABLE `members`
  DROP FOREIGN KEY `Member_groupId_fkey`;

-- Drop the duplicate constraints in the `reports` table
ALTER TABLE `reports`
  DROP FOREIGN KEY `Report_memberName_memberGroupId_fkey`,
  DROP FOREIGN KEY `Report_periodStartDate_periodEndDate_fkey`;

-- Ensure the constraint names in `groups` are consistent
ALTER TABLE `groups`
  DROP INDEX `Group_number_key`,
  ADD UNIQUE KEY `groups_number_key` (`number`);

-- RenameIndex
ALTER TABLE `reports` RENAME INDEX `Report_memberName_memberGroupId_pages_totalPages_type_period_key` TO `reports_memberName_memberGroupId_pages_totalPages_type_perio_key`;