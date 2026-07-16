/*
  Warnings:

  - You are about to drop the column `birthDay` on the `SajuReport` table. All the data in the column will be lost.
  - You are about to drop the column `birthHour` on the `SajuReport` table. All the data in the column will be lost.
  - You are about to drop the column `birthMonth` on the `SajuReport` table. All the data in the column will be lost.
  - You are about to drop the column `birthYear` on the `SajuReport` table. All the data in the column will be lost.
  - You are about to drop the column `calendarType` on the `SajuReport` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `SajuReport` table. All the data in the column will be lost.
  - You are about to drop the column `worryCategory` on the `SajuReport` table. All the data in the column will be lost.
  - You are about to drop the column `worryText` on the `SajuReport` table. All the data in the column will be lost.
  - Added the required column `applicationNum` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportStatus` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthDay` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthMonth` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthYear` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calendarType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SajuReportHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SajuReportHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SajuReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "discountPrice" INTEGER,
    "description" TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 21,
    "toc" TEXT NOT NULL,
    "requiredInputs" TEXT NOT NULL,
    "generationMethod" TEXT NOT NULL DEFAULT 'AUTO',
    "pdfTemplate" TEXT,
    "estimatedTime" TEXT NOT NULL,
    "isSale" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "msgType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PromotionUse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promotionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromotionUse_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromotionUse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tocCover" BOOLEAN NOT NULL DEFAULT true,
    "tocElements" BOOLEAN NOT NULL DEFAULT true,
    "tocNature" BOOLEAN NOT NULL DEFAULT true,
    "tocStrengths" BOOLEAN NOT NULL DEFAULT true,
    "tocWealth" BOOLEAN NOT NULL DEFAULT true,
    "tocJob" BOOLEAN NOT NULL DEFAULT true,
    "tocBusiness" BOOLEAN NOT NULL DEFAULT true,
    "tocLove" BOOLEAN NOT NULL DEFAULT true,
    "tocHealth" BOOLEAN NOT NULL DEFAULT true,
    "tocDaeun" BOOLEAN NOT NULL DEFAULT true,
    "tocYearly" BOOLEAN NOT NULL DEFAULT true,
    "tocMonthly" BOOLEAN NOT NULL DEFAULT true,
    "tocActionGuide" BOOLEAN NOT NULL DEFAULT true,
    "tocSummary" BOOLEAN NOT NULL DEFAULT true,
    "interpretDayStem" TEXT,
    "interpretElements" TEXT,
    "interpretSipsin" TEXT,
    "interpretDaeun" TEXT,
    "interpretWealth" TEXT,
    "suggestJob" TEXT,
    "warningText" TEXT,
    "positivePhrases" TEXT,
    "forbiddenPhrases" TEXT,
    "coverDesign" TEXT NOT NULL DEFAULT 'default',
    "themeColor" TEXT NOT NULL DEFAULT '#A3845B',
    "logoPath" TEXT,
    "watermarkPath" TEXT,
    "displayNameType" TEXT NOT NULL DEFAULT 'name_only',
    "showPageNumbers" BOOLEAN NOT NULL DEFAULT true,
    "pdfFooterText" TEXT,
    "adBannerArea" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StatisticSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "averageGenTime" INTEGER NOT NULL DEFAULT 0,
    "funnelDropouts" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" INTEGER NOT NULL DEFAULT 0,
    "discountTotal" INTEGER NOT NULL DEFAULT 0,
    "refundTotal" INTEGER NOT NULL DEFAULT 0,
    "netRevenue" INTEGER NOT NULL DEFAULT 0,
    "refNaver" INTEGER NOT NULL DEFAULT 0,
    "refGoogle" INTEGER NOT NULL DEFAULT 0,
    "refMeta" INTEGER NOT NULL DEFAULT 0,
    "refInstagram" INTEGER NOT NULL DEFAULT 0,
    "refYoutube" INTEGER NOT NULL DEFAULT 0,
    "refKakao" INTEGER NOT NULL DEFAULT 0,
    "refDirect" INTEGER NOT NULL DEFAULT 0,
    "refAffiliate" INTEGER NOT NULL DEFAULT 0,
    "linkSentCount" INTEGER NOT NULL DEFAULT 0,
    "openRate" REAL NOT NULL DEFAULT 0.0,
    "pdfDownloadCount" INTEGER NOT NULL DEFAULT 0,
    "avgReadCount" REAL NOT NULL DEFAULT 0.0,
    "reissueCount" INTEGER NOT NULL DEFAULT 0,
    "crossSellCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT '혜안당',
    "privacyDuration" INTEGER NOT NULL DEFAULT 365,
    "termsAndConds" TEXT,
    "apiConfig" TEXT,
    "backupConfig" TEXT,
    "alertConfig" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationNum" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reportStatus" TEXT NOT NULL,
    "refundStatus" TEXT,
    "cashReceiptInfo" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("amount", "createdAt", "id", "status", "userId") SELECT "amount", "createdAt", "id", "status", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_applicationNum_key" ON "Order"("applicationNum");
CREATE TABLE "new_SajuReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'INPUT_COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SajuReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SajuReport" ("createdAt", "id", "unlocked", "userId") SELECT "createdAt", "id", "unlocked", "userId" FROM "SajuReport";
DROP TABLE "SajuReport";
ALTER TABLE "new_SajuReport" RENAME TO "SajuReport";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "birthMonth" INTEGER NOT NULL,
    "birthDay" INTEGER NOT NULL,
    "calendarType" TEXT NOT NULL,
    "isLeapMonth" BOOLEAN NOT NULL DEFAULT false,
    "birthHour" TEXT,
    "birthPlace" TEXT,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "worryText" TEXT,
    "grade" TEXT NOT NULL DEFAULT 'NORMAL',
    "deleteRequested" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "phone") SELECT "createdAt", "email", "id", "name", "phone" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StatisticSummary_date_key" ON "StatisticSummary"("date");
