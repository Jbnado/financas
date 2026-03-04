import {
  Controller,
  Get,
  Query,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import type { Request } from "express";
import { PatrimonyService } from "./patrimony.service.js";
import { PatrimonySummaryResponseDto } from "./dto/patrimony-summary-response.dto.js";
import { PatrimonyDistributionResponseDto } from "./dto/patrimony-distribution-response.dto.js";
import { PatrimonyEvolutionResponseDto } from "./dto/patrimony-evolution-response.dto.js";

@ApiTags("patrimony")
@ApiBearerAuth()
@Controller("patrimony")
export class PatrimonyController {
  constructor(private readonly service: PatrimonyService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get patrimony summary" })
  @ApiResponse({ status: 200, type: PatrimonySummaryResponseDto })
  async getSummary(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.getSummary(user.id);
  }

  @Get("distribution")
  @ApiOperation({ summary: "Get patrimony distribution by type" })
  @ApiResponse({ status: 200, type: PatrimonyDistributionResponseDto })
  async getDistribution(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.getDistribution(user.id);
  }

  @Get("evolution")
  @ApiOperation({ summary: "Get patrimony evolution over billing cycles" })
  @ApiResponse({ status: 200, type: PatrimonyEvolutionResponseDto })
  @ApiQuery({ name: "last", required: false, type: Number, description: "Number of cycles to return (default 6)" })
  async getEvolution(
    @Req() req: Request,
    @Query("last") last?: string,
  ) {
    const user = req.user as { id: string };
    const count = last ? parseInt(last, 10) : 6;
    return this.service.getEvolution(user.id, count);
  }
}
