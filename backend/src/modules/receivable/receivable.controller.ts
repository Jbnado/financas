import {
  Controller,
  Get,
  Post,
  Body,
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
} from "@nestjs/swagger";
import type { Request } from "express";
import { ReceivableService } from "./receivable.service.js";
import { CreatePaymentDto } from "./dto/create-payment.dto.js";
import { ReceivableResponseDto, ReceivableSummaryDto } from "./dto/receivable-response.dto.js";

@ApiTags("receivables")
@ApiBearerAuth()
@Controller()
export class ReceivableController {
  constructor(private readonly service: ReceivableService) {}

  @Post("receivables/:id/payments")
  @ApiOperation({ summary: "Record a payment for a receivable" })
  @ApiResponse({ status: 201, description: "Payment recorded" })
  @ApiResponse({ status: 400, description: "Overpayment or invalid amount" })
  @ApiResponse({ status: 404, description: "Receivable not found" })
  async createPayment(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) receivableId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    const user = req.user as { id: string };
    return this.service.createPayment(user.id, receivableId, dto);
  }

  @Get("persons/:personId/receivables")
  @ApiOperation({ summary: "List receivables for a person" })
  @ApiResponse({ status: 200, type: [ReceivableResponseDto] })
  async findByPerson(
    @Req() req: Request,
    @Param("personId", ParseUUIDPipe) personId: string,
    @Query("billingCycleId") billingCycleId?: string,
  ) {
    const user = req.user as { id: string };
    return this.service.findByPerson(user.id, personId, billingCycleId);
  }

  @Get("receivables/summary")
  @ApiOperation({ summary: "Get receivables summary consolidated by person" })
  @ApiResponse({ status: 200, type: [ReceivableSummaryDto] })
  async getSummary(
    @Req() req: Request,
    @Query("billingCycleId") billingCycleId?: string,
  ) {
    const user = req.user as { id: string };
    return this.service.getSummary(user.id, billingCycleId);
  }
}
