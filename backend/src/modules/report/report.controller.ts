import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import type { Request } from "express";
import { ReportService } from "./report.service.js";

@ApiTags("reports")
@ApiBearerAuth()
@Controller("reports")
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Get("category-distribution/:billingCycleId")
  @ApiOperation({ summary: "Category distribution for a billing cycle" })
  @ApiResponse({ status: 200, description: "Category distribution data" })
  @ApiResponse({ status: 404, description: "Billing cycle not found" })
  async categoryDistribution(
    @Req() req: Request,
    @Param("billingCycleId", ParseUUIDPipe) billingCycleId: string,
  ) {
    const user = req.user as { id: string };
    return this.service.categoryDistribution(user.id, billingCycleId);
  }

  @Get("cycle-evolution")
  @ApiOperation({ summary: "Net result evolution across recent cycles" })
  @ApiResponse({ status: 200, description: "Cycle evolution data" })
  @ApiQuery({ name: "last", required: false, type: Number, description: "Number of recent cycles (default 6)" })
  async cycleEvolution(
    @Req() req: Request,
    @Query("last") last?: string,
  ) {
    const user = req.user as { id: string };
    const count = last ? parseInt(last, 10) : 6;
    return this.service.cycleEvolution(user.id, count);
  }

  @Get("cycle-comparison/:billingCycleId")
  @ApiOperation({ summary: "Compare billing cycle with previous one" })
  @ApiResponse({ status: 200, description: "Cycle comparison data" })
  @ApiResponse({ status: 404, description: "Billing cycle not found" })
  async cycleComparison(
    @Req() req: Request,
    @Param("billingCycleId", ParseUUIDPipe) billingCycleId: string,
  ) {
    const user = req.user as { id: string };
    return this.service.cycleComparison(user.id, billingCycleId);
  }
}
