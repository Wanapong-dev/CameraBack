/*
  Warnings:

  - Added the required column `categoryId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Image` ADD COLUMN `categoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
