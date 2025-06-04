/*
  Warnings:

  - The `resume` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `candidateResume` column on the `JobApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "resume",
ADD COLUMN     "resume" BYTEA;

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "candidateResume",
ADD COLUMN     "candidateResume" BYTEA;
