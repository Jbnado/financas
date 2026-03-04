import { Module } from "@nestjs/common";
import { BillingCycleModule } from "../billing-cycle/billing-cycle.module.js";
import { TransactionController } from "./transaction.controller.js";
import { TransactionService } from "./transaction.service.js";
import { InstallmentService } from "./installment.service.js";

@Module({
  imports: [BillingCycleModule],
  controllers: [TransactionController],
  providers: [TransactionService, InstallmentService],
  exports: [TransactionService],
})
export class TransactionModule {}
