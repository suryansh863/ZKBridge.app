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
    "targetAddress" TEXT NOT NULL,
    "zkProof" TEXT,
    "zkProofHash" TEXT,
    "merkleProof" TEXT,
    "merkleRoot" TEXT,
    "blockHeight" INTEGER,
    "blockHash" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "gasUsed" TEXT,
    "gasPrice" TEXT,
    "fee" TEXT,
    "errorMessage" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "proofGeneratedAt" DATETIME,
    "proofVerifiedAt" DATETIME,
    "submittedAt" DATETIME,
    "completedAt" DATETIME,
    "estimatedCompletionTime" DATETIME,
    "network" TEXT NOT NULL DEFAULT 'testnet',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "bridge_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");

-- CreateIndex
CREATE UNIQUE INDEX "bridge_transactions_sourceTxHash_key" ON "bridge_transactions"("sourceTxHash");

-- CreateIndex
CREATE INDEX "bridge_transactions_status_idx" ON "bridge_transactions"("status");

-- CreateIndex
CREATE INDEX "bridge_transactions_direction_idx" ON "bridge_transactions"("direction");

-- CreateIndex
CREATE INDEX "bridge_transactions_createdAt_idx" ON "bridge_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "bridge_transactions_userId_idx" ON "bridge_transactions"("userId");

-- CreateIndex
CREATE INDEX "bridge_transactions_sourceTxHash_idx" ON "bridge_transactions"("sourceTxHash");

-- CreateIndex
CREATE INDEX "bridge_transactions_targetTxHash_idx" ON "bridge_transactions"("targetTxHash");

-- CreateIndex
CREATE INDEX "transaction_events_transactionId_idx" ON "transaction_events"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_events_eventType_idx" ON "transaction_events"("eventType");

-- CreateIndex
CREATE INDEX "transaction_events_createdAt_idx" ON "transaction_events"("createdAt");
