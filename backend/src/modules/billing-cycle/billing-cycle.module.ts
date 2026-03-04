import { Module } from "@nestjs/common";
import { BillingCycleController } from "./billing-cycle.controller.js";
import { BillingCycleService } from "./billing-cycle.service.js";
import { PatrimonyModule } from "../patrimony/patrimony.module.js";

@Module({
  imports: [PatrimonyModule],
  controllers: [BillingCycleController],
  providers: [BillingCycleService],
  exports: [BillingCycleService],
})
export class BillingCycleModule {}
