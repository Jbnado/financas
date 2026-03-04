import { Controller, Get, Query, Req } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import type { Request } from "express";
import { ProjectionService } from "./projection.service.js";

@ApiTags("projections")
@ApiBearerAuth()
@Controller("projections")
export class ProjectionController {
  constructor(private readonly service: ProjectionService) {}

  @Get()
  @ApiOperation({ summary: "Financial projection for upcoming months" })
  @ApiResponse({ status: 200, description: "Projection data with alerts" })
  @ApiQuery({
    name: "months",
    required: false,
    type: Number,
    description: "Number of months to project (default 6, max 12)",
  })
  async getProjection(@Req() req: Request, @Query("months") months?: string) {
    const user = req.user as { id: string };
    const count = months ? parseInt(months, 10) : 6;
    return this.service.getProjection(user.id, count);
  }

  @Get("installment-commitments")
  @ApiOperation({ summary: "Future installment commitments by month" })
  @ApiResponse({
    status: 200,
    description: "Installment commitments grouped by cycle",
  })
  async getInstallmentCommitments(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.getInstallmentCommitments(user.id);
  }
}
