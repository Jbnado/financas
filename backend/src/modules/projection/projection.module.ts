import { Module } from "@nestjs/common";
import { ProjectionController } from "./projection.controller.js";
import { ProjectionService } from "./projection.service.js";

@Module({
  controllers: [ProjectionController],
  providers: [ProjectionService],
})
export class ProjectionModule {}
