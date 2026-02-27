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
import { BillingCycleService } from "./billing-cycle.service.js";
import { CreateBillingCycleDto } from "./dto/create-billing-cycle.dto.js";
import { UpdateBillingCycleDto } from "./dto/update-billing-cycle.dto.js";
import {
  BillingCycleResponseDto,
  BillingCycleDetailResponseDto,
} from "./dto/billing-cycle-response.dto.js";

@ApiTags("billing-cycles")
@ApiBearerAuth()
@Controller("billing-cycles")
export class BillingCycleController {
  constructor(private readonly service: BillingCycleService) {}

  @Post()
  @ApiOperation({ summary: "Create a new billing cycle" })
  @ApiResponse({ status: 201, type: BillingCycleResponseDto })
  async create(
    @Req() req: Request,
    @Body() dto: CreateBillingCycleDto,
  ) {
    const user = req.user as { id: string };
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List all billing cycles" })
  @ApiResponse({ status: 200, type: [BillingCycleResponseDto] })
  async findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get billing cycle with summary" })
  @ApiResponse({ status: 200, type: BillingCycleDetailResponseDto })
  @ApiResponse({ status: 404, description: "Billing cycle not found" })
  async findOne(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.findOne(user.id, id);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a billing cycle" })
  @ApiResponse({ status: 200, type: BillingCycleResponseDto })
  @ApiResponse({ status: 400, description: "Cannot edit closed cycle" })
  @ApiResponse({ status: 404, description: "Billing cycle not found" })
  async update(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBillingCycleDto,
  ) {
    const user = req.user as { id: string };
    return this.service.update(user.id, id, dto);
  }
}
