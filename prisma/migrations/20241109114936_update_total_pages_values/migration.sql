-- Set totalPages to 0 where there is only one Report for a specific Period and pages = 0
WITH SingleZeroPages AS (
  SELECT "memberName", "memberGroupId", "periodStartDate", "periodEndDate"
  FROM "Report"
  GROUP BY "memberName", "memberGroupId", "periodStartDate", "periodEndDate"
  HAVING COUNT(*) = 1 AND MAX("pages") = 0
)
UPDATE "Report" AS r
SET "totalPages" = 0
FROM SingleZeroPages AS szp
WHERE r."memberName" = szp."memberName"
  AND r."memberGroupId" = szp."memberGroupId"
  AND r."periodStartDate" = szp."periodStartDate"
  AND r."periodEndDate" = szp."periodEndDate";

-- Update totalPages for all other reports:
-- If the max pages > 20, set totalPages to max pages.
-- If the max pages <= 20, set totalPages to 20.
WITH MaxPages AS (
  SELECT "memberName", "memberGroupId", "periodStartDate", "periodEndDate",
         MAX("pages") AS max_pages
  FROM "Report"
  GROUP BY "memberName", "memberGroupId", "periodStartDate", "periodEndDate"
  HAVING COUNT(*) > 1 OR MAX("pages") > 0
)
UPDATE "Report" AS r
SET "totalPages" = CASE
                     WHEN mp.max_pages > 20 THEN mp.max_pages
                     ELSE 20
                   END
FROM MaxPages AS mp
WHERE r."memberName" = mp."memberName"
  AND r."memberGroupId" = mp."memberGroupId"
  AND r."periodStartDate" = mp."periodStartDate"
  AND r."periodEndDate" = mp."periodEndDate"
  AND NOT EXISTS (
    SELECT 1
    FROM SingleZeroPages AS szp
    WHERE szp."memberName" = mp."memberName"
      AND szp."memberGroupId" = mp."memberGroupId"
      AND szp."periodStartDate" = mp."periodStartDate"
      AND szp."periodEndDate" = mp."periodEndDate"
  );
