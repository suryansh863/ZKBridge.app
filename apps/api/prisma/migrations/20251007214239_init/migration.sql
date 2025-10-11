-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bridge_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sourceTxHash" TEXT NOT NULL,
    "sourceAmount" TEXT NOT NULL,
    "sourceAddress" TEXT NOT NULL,
    "targetTxHash" TEXT,
    "targetAmount" TEXT,
    "targetAddress" TEXT,
    "zkProof" TEXT,
    "merkleProof" TEXT,
    "merkleRoot" TEXT,
    "blockHeight" INTEGER,
    "blockHash" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "gasUsed" TEXT,
    "gasPrice" TEXT,
    "fee" TEXT,
    "errorMessage" TEXT,
    "proofGeneratedAt" DATETIME,
    "proofVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "bridge_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");
