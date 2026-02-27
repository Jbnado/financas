import { Module } from "@nestjs/common";
import { BillingCycleController } from "./billing-cycle.controller.js";
import { BillingCycleService } from "./billing-cycle.service.js";

@Module({
  controllers: [BillingCycleController],
  providers: [BillingCycleService],
  exports: [BillingCycleService],
})
export class BillingCycleModule {}
