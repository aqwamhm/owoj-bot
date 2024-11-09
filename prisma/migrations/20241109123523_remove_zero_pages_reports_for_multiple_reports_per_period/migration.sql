-- Create a temporary table to identify members with multiple reports per period and 0 pages
CREATE TEMPORARY TABLE ReportsToDelete AS
SELECT `id`
FROM `Report` AS r
WHERE `pages` = 0
  AND EXISTS (
    SELECT 1
    FROM `Report` AS r2
    WHERE r.`memberName` = r2.`memberName`
      AND r.`memberGroupId` = r2.`memberGroupId`
      AND r.`periodStartDate` = r2.`periodStartDate`
      AND r.`periodEndDate` = r2.`periodEndDate`
      AND r2.`id` <> r.`id`
  );

-- Delete the identified reports with 0 pages for members with multiple reports per period
DELETE FROM `Report`
WHERE `id` IN (SELECT `id` FROM ReportsToDelete);

-- Drop the temporary table
DROP TEMPORARY TABLE ReportsToDelete;