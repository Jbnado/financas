-- CreateTable
CREATE TABLE "fixed_expenses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimated_amount" DECIMAL(15,2) NOT NULL,
    "due_day" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixed_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixed_expense_entries" (
    "id" TEXT NOT NULL,
    "fixed_expense_id" TEXT NOT NULL,
    "billing_cycle_id" TEXT NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixed_expense_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "estimated_amount" DECIMAL(15,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_entries" (
    "id" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,
    "billing_cycle_id" TEXT NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fixed_expenses_user_id_idx" ON "fixed_expenses"("user_id");

-- CreateIndex
CREATE INDEX "fixed_expense_entries_fixed_expense_id_idx" ON "fixed_expense_entries"("fixed_expense_id");

-- CreateIndex
CREATE INDEX "fixed_expense_entries_billing_cycle_id_idx" ON "fixed_expense_entries"("billing_cycle_id");

-- CreateIndex
CREATE INDEX "taxes_user_id_idx" ON "taxes"("user_id");

-- CreateIndex
CREATE INDEX "tax_entries_tax_id_idx" ON "tax_entries"("tax_id");

-- CreateIndex
CREATE INDEX "tax_entries_billing_cycle_id_idx" ON "tax_entries"("billing_cycle_id");

-- AddForeignKey
ALTER TABLE "fixed_expenses" ADD CONSTRAINT "fixed_expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_expense_entries" ADD CONSTRAINT "fixed_expense_entries_fixed_expense_id_fkey" FOREIGN KEY ("fixed_expense_id") REFERENCES "fixed_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_expense_entries" ADD CONSTRAINT "fixed_expense_entries_billing_cycle_id_fkey" FOREIGN KEY ("billing_cycle_id") REFERENCES "billing_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxes" ADD CONSTRAINT "taxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_entries" ADD CONSTRAINT "tax_entries_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_entries" ADD CONSTRAINT "tax_entries_billing_cycle_id_fkey" FOREIGN KEY ("billing_cycle_id") REFERENCES "billing_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
