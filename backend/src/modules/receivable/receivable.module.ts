import { Module } from "@nestjs/common";
import { ReceivableController } from "./receivable.controller.js";
import { ReceivableService } from "./receivable.service.js";

@Module({
  controllers: [ReceivableController],
  providers: [ReceivableService],
  exports: [ReceivableService],
})
export class ReceivableModule {}
