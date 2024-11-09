-- Create a temporary table to hold the SingleZeroPages results
CREATE TEMPORARY TABLE SingleZeroPages AS
SELECT `memberName`, `memberGroupId`, `periodStartDate`, `periodEndDate`
FROM `Report`
GROUP BY `memberName`, `memberGroupId`, `periodStartDate`, `periodEndDate`
HAVING COUNT(*) = 1 AND MAX(`pages`) = 0;

-- Update totalPages to 0 for records in SingleZeroPages
UPDATE `Report` AS r
JOIN SingleZeroPages AS szp
ON r.`memberName` = szp.`memberName`
  AND r.`memberGroupId` = szp.`memberGroupId`
  AND r.`periodStartDate` = szp.`periodStartDate`
  AND r.`periodEndDate` = szp.`periodEndDate`
SET r.`totalPages` = 0;

-- Create another temporary table for MaxPages
CREATE TEMPORARY TABLE MaxPages AS
SELECT `memberName`, `memberGroupId`, `periodStartDate`, `periodEndDate`,
       MAX(`pages`) AS max_pages
FROM `Report`
GROUP BY `memberName`, `memberGroupId`, `periodStartDate`, `periodEndDate`
HAVING COUNT(*) > 1 OR MAX(`pages`) > 0;

-- Update totalPages based on max_pages values
UPDATE `Report` AS r
JOIN MaxPages AS mp
ON r.`memberName` = mp.`memberName`
  AND r.`memberGroupId` = mp.`memberGroupId`
  AND r.`periodStartDate` = mp.`periodStartDate`
  AND r.`periodEndDate` = mp.`periodEndDate`
SET r.`totalPages` = CASE
                       WHEN mp.max_pages > 20 THEN mp.max_pages
                       ELSE 20
                     END
WHERE NOT EXISTS (
  SELECT 1
  FROM SingleZeroPages AS szp
  WHERE szp.`memberName` = mp.`memberName`
    AND szp.`memberGroupId` = mp.`memberGroupId`
    AND szp.`periodStartDate` = mp.`periodStartDate`
    AND szp.`periodEndDate` = mp.`periodEndDate`
);

-- Drop the temporary tables
DROP TEMPORARY TABLE SingleZeroPages;
DROP TEMPORARY TABLE MaxPages;
