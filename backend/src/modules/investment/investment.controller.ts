import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
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
import { InvestmentService } from "./investment.service.js";
import { CreateInvestmentDto } from "./dto/create-investment.dto.js";
import { UpdateInvestmentDto } from "./dto/update-investment.dto.js";
import { UpdateValueDto } from "./dto/update-value.dto.js";
import { InvestmentResponseDto } from "./dto/investment-response.dto.js";

@ApiTags("investments")
@ApiBearerAuth()
@Controller("investments")
export class InvestmentController {
  constructor(private readonly service: InvestmentService) {}

  @Post()
  @ApiOperation({ summary: "Create a new investment" })
  @ApiResponse({ status: 201, type: InvestmentResponseDto })
  async create(@Req() req: Request, @Body() dto: CreateInvestmentDto) {
    const user = req.user as { id: string };
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List active investments" })
  @ApiResponse({ status: 200, type: [InvestmentResponseDto] })
  async findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.findAll(user.id);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update an investment" })
  @ApiResponse({ status: 200, type: InvestmentResponseDto })
  @ApiResponse({ status: 404, description: "Investment not found" })
  async update(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvestmentDto,
  ) {
    const user = req.user as { id: string };
    return this.service.update(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete an investment" })
  @ApiResponse({ status: 200, type: InvestmentResponseDto })
  @ApiResponse({ status: 404, description: "Investment not found" })
  async remove(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.remove(user.id, id);
  }

  @Patch(":id/value")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update investment current value" })
  @ApiResponse({ status: 200, type: InvestmentResponseDto })
  @ApiResponse({ status: 404, description: "Investment not found" })
  async updateValue(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateValueDto,
  ) {
    const user = req.user as { id: string };
    return this.service.updateValue(user.id, id, dto);
  }
}
