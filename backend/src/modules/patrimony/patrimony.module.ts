import { Module } from "@nestjs/common";
import { PatrimonyController } from "./patrimony.controller.js";
import { PatrimonyService } from "./patrimony.service.js";

@Module({
  controllers: [PatrimonyController],
  providers: [PatrimonyService],
  exports: [PatrimonyService],
})
export class PatrimonyModule {}
