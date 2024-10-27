/*
  Warnings:

  - A unique constraint covering the columns `[memberName,memberGroupId,pages,periodStartDate,periodEndDate]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Report_memberName_memberGroupId_pages_periodStartDate_period_key` ON `Report`(`memberName`, `memberGroupId`, `pages`, `periodStartDate`, `periodEndDate`);
