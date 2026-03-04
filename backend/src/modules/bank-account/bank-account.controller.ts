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
import { BankAccountService } from "./bank-account.service.js";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto.js";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto.js";
import { UpdateBalanceDto } from "./dto/update-balance.dto.js";
import { BankAccountResponseDto } from "./dto/bank-account-response.dto.js";

@ApiTags("bank-accounts")
@ApiBearerAuth()
@Controller("bank-accounts")
export class BankAccountController {
  constructor(private readonly service: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: "Create a new bank account" })
  @ApiResponse({ status: 201, type: BankAccountResponseDto })
  async create(@Req() req: Request, @Body() dto: CreateBankAccountDto) {
    const user = req.user as { id: string };
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List active bank accounts" })
  @ApiResponse({ status: 200, type: [BankAccountResponseDto] })
  async findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.findAll(user.id);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a bank account" })
  @ApiResponse({ status: 200, type: BankAccountResponseDto })
  @ApiResponse({ status: 404, description: "Bank account not found" })
  async update(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    const user = req.user as { id: string };
    return this.service.update(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete a bank account" })
  @ApiResponse({ status: 200, type: BankAccountResponseDto })
  @ApiResponse({ status: 404, description: "Bank account not found" })
  async remove(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.remove(user.id, id);
  }

  @Patch(":id/balance")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update bank account balance" })
  @ApiResponse({ status: 200, type: BankAccountResponseDto })
  @ApiResponse({ status: 404, description: "Bank account not found" })
  async updateBalance(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBalanceDto,
  ) {
    const user = req.user as { id: string };
    return this.service.updateBalance(user.id, id, dto);
  }
}
