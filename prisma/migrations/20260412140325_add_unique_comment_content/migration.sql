/*
  Warnings:

  - A unique constraint covering the columns `[content]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comment_content_key" ON "Comment"("content");
