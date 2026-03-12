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
import {
  ProjectionResponseDto,
  InstallmentCommitmentsResponseDto,
} from "./dto/projection-response.dto.js";

@ApiTags("projections")
@ApiBearerAuth()
@Controller("projections")
export class ProjectionController {
  constructor(private readonly service: ProjectionService) {}

  @Get()
  @ApiOperation({ summary: "Financial projection for upcoming months" })
  @ApiResponse({ status: 200, description: "Projection data with alerts", type: ProjectionResponseDto })
  @ApiQuery({
    name: "months",
    required: false,
    type: Number,
    description: "Number of months to project (default 6, max 12)",
  })
  async getProjection(@Req() req: Request, @Query("months") months?: string) {
    const user = req.user as { id: string };
    const parsed = months ? parseInt(months, 10) : 6;
    const count = isNaN(parsed) ? 6 : parsed;
    return this.service.getProjection(user.id, count);
  }

  @Get("installment-commitments")
  @ApiOperation({ summary: "Future installment commitments by month" })
  @ApiResponse({
    status: 200,
    description: "Installment commitments grouped by cycle",
    type: InstallmentCommitmentsResponseDto,
  })
  async getInstallmentCommitments(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.getInstallmentCommitments(user.id);
  }
}
