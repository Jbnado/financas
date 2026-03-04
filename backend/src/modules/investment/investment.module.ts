import { Module } from "@nestjs/common";
import { InvestmentController } from "./investment.controller.js";
import { InvestmentService } from "./investment.service.js";

@Module({
  controllers: [InvestmentController],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
