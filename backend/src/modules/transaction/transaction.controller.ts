import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
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
import { TransactionService } from "./transaction.service.js";
import { CreateTransactionDto } from "./dto/create-transaction.dto.js";
import { UpdateTransactionDto } from "./dto/update-transaction.dto.js";
import { TransactionFiltersDto } from "./dto/transaction-filters.dto.js";
import { TransactionResponseDto } from "./dto/transaction-response.dto.js";

@ApiTags("transactions")
@ApiBearerAuth()
@Controller()
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post("transactions")
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: "Cycle is closed" })
  async create(@Req() req: Request, @Body() dto: CreateTransactionDto) {
    const user = req.user as { id: string };
    return this.service.create(user.id, dto);
  }

  @Get("billing-cycles/:cycleId/transactions")
  @ApiOperation({ summary: "List transactions for a billing cycle" })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async findAllByCycle(
    @Req() req: Request,
    @Param("cycleId", ParseUUIDPipe) cycleId: string,
    @Query() filters: TransactionFiltersDto,
  ) {
    const user = req.user as { id: string };
    const parsedFilters = {
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.paymentMethodId && {
        paymentMethodId: filters.paymentMethodId,
      }),
      ...(filters.isPaid !== undefined && {
        isPaid: filters.isPaid === "true",
      }),
      ...(filters.personId && { personId: filters.personId }),
      ...(filters.search && { search: filters.search }),
    };
    return this.service.findAllByCycle(user.id, cycleId, parsedFilters);
  }

  @Get("transactions/:id")
  @ApiOperation({ summary: "Get a transaction by ID" })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async findOne(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.findOne(user.id, id);
  }

  @Put("transactions/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a transaction" })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: "Cycle is closed" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async update(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const user = req.user as { id: string };
    return this.service.update(user.id, id, dto);
  }

  @Delete("transactions/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a transaction (hard delete)" })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async remove(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.remove(user.id, id);
  }

  @Patch("transactions/:id/toggle-paid")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Toggle transaction paid status" })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async togglePaid(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.togglePaid(user.id, id);
  }
}
