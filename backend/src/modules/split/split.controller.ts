import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import type { Request } from "express";
import { SplitService } from "./split.service.js";
import { CreateSplitsDto } from "./dto/create-splits.dto.js";
import { SplitResponseDto } from "./dto/split-response.dto.js";

@ApiTags("splits")
@ApiBearerAuth()
@Controller()
export class SplitController {
  constructor(private readonly service: SplitService) {}

  @Post("transactions/:id/splits")
  @ApiOperation({ summary: "Create splits for a transaction" })
  @ApiResponse({ status: 201, description: "Splits created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async createSplits(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) transactionId: string,
    @Body() dto: CreateSplitsDto,
  ) {
    const user = req.user as { id: string };
    return this.service.createSplits(user.id, transactionId, dto);
  }

  @Put("transactions/:id/splits")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Replace splits for a transaction" })
  @ApiResponse({ status: 200, description: "Splits replaced" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async replaceSplits(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) transactionId: string,
    @Body() dto: CreateSplitsDto,
  ) {
    const user = req.user as { id: string };
    return this.service.replaceSplits(user.id, transactionId, dto);
  }

  @Get("transactions/:id/splits")
  @ApiOperation({ summary: "Get splits for a transaction" })
  @ApiResponse({ status: 200, description: "Splits with userAmount" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async findByTransaction(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) transactionId: string,
  ) {
    const user = req.user as { id: string };
    return this.service.findByTransaction(user.id, transactionId);
  }
}
