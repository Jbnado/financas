-- CreateTable
CREATE TABLE "patrimony_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "billing_cycle_id" TEXT NOT NULL,
    "total_bank_accounts" DECIMAL(15,2) NOT NULL,
    "total_investments" DECIMAL(15,2) NOT NULL,
    "total_assets" DECIMAL(15,2) NOT NULL,
    "future_installments" DECIMAL(15,2) NOT NULL,
    "net_patrimony" DECIMAL(15,2) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patrimony_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patrimony_snapshots_user_id_idx" ON "patrimony_snapshots"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patrimony_snapshots_billing_cycle_id_key" ON "patrimony_snapshots"("billing_cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "patrimony_snapshots_user_id_billing_cycle_id_key" ON "patrimony_snapshots"("user_id", "billing_cycle_id");

-- AddForeignKey
ALTER TABLE "patrimony_snapshots" ADD CONSTRAINT "patrimony_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrimony_snapshots" ADD CONSTRAINT "patrimony_snapshots_billing_cycle_id_fkey" FOREIGN KEY ("billing_cycle_id") REFERENCES "billing_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
