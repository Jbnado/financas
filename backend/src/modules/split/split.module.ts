import { Module } from "@nestjs/common";
import { SplitController } from "./split.controller.js";
import { SplitService } from "./split.service.js";

@Module({
  controllers: [SplitController],
  providers: [SplitService],
  exports: [SplitService],
})
export class SplitModule {}
