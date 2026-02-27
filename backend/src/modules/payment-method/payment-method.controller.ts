import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { PaymentMethodService } from "./payment-method.service.js";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto.js";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto.js";
import { PaymentMethodResponseDto } from "./dto/payment-method-response.dto.js";

@ApiTags("payment-methods")
@ApiBearerAuth()
@Controller("payment-methods")
export class PaymentMethodController {
  constructor(private readonly service: PaymentMethodService) {}

  @Post()
  @ApiOperation({ summary: "Create a new payment method" })
  @ApiResponse({ status: 201, type: PaymentMethodResponseDto })
  async create(
    @Req() req: Request,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    const user = req.user as { id: string };
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List all active payment methods" })
  @ApiResponse({ status: 200, type: [PaymentMethodResponseDto] })
  async findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.findAll(user.id);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a payment method" })
  @ApiResponse({ status: 200, type: PaymentMethodResponseDto })
  @ApiResponse({ status: 404, description: "Payment method not found" })
  async update(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    const user = req.user as { id: string };
    return this.service.update(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete a payment method" })
  @ApiResponse({ status: 200, type: PaymentMethodResponseDto })
  @ApiResponse({ status: 404, description: "Payment method not found" })
  async remove(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.remove(user.id, id);
  }
}
