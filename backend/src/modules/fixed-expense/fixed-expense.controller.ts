import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FixedExpenseService } from "./fixed-expense.service";
import { CreateFixedExpenseDto } from "./dto/create-fixed-expense.dto";
import { UpdateFixedExpenseDto } from "./dto/update-fixed-expense.dto";
import { CreateFixedExpenseEntryDto } from "./dto/create-fixed-expense-entry.dto";
import {
  FixedExpenseResponseDto,
  FixedExpenseEntryResponseDto,
  FixedExpenseWithEntryDto,
} from "./dto/fixed-expense-response.dto";

@ApiTags("fixed-expenses")
@ApiBearerAuth()
@Controller()
export class FixedExpenseController {
  constructor(private readonly service: FixedExpenseService) {}

  @Post("fixed-expenses")
  @ApiOperation({ summary: "Create fixed expense" })
  @ApiResponse({ status: 201, type: FixedExpenseResponseDto })
  create(@Req() req: any, @Body() dto: CreateFixedExpenseDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get("fixed-expenses")
  @ApiOperation({ summary: "List active fixed expenses" })
  @ApiResponse({ status: 200, type: [FixedExpenseResponseDto] })
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Put("fixed-expenses/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update fixed expense" })
  @ApiResponse({ status: 200, type: FixedExpenseResponseDto })
  update(
    @Req() req: any,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateFixedExpenseDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete("fixed-expenses/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete fixed expense" })
  @ApiResponse({ status: 200, type: FixedExpenseResponseDto })
  remove(@Req() req: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Post("fixed-expenses/:id/entries")
  @ApiOperation({ summary: "Create entry for a billing cycle" })
  @ApiResponse({ status: 201, type: FixedExpenseEntryResponseDto })
  createEntry(
    @Req() req: any,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateFixedExpenseEntryDto,
  ) {
    return this.service.createEntry(req.user.id, id, dto);
  }

  @Patch("fixed-expense-entries/:id/toggle-paid")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Toggle entry paid status" })
  @ApiResponse({ status: 200, type: FixedExpenseEntryResponseDto })
  togglePaid(@Req() req: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.toggleEntryPaid(req.user.id, id);
  }

  @Get("billing-cycles/:cycleId/fixed-expenses")
  @ApiOperation({ summary: "List fixed expenses with entry for a cycle" })
  @ApiResponse({ status: 200, type: [FixedExpenseWithEntryDto] })
  findByCycle(
    @Req() req: any,
    @Param("cycleId", ParseUUIDPipe) cycleId: string,
  ) {
    return this.service.findByCycle(req.user.id, cycleId);
  }

  @Get("fixed-expenses/:id/history")
  @ApiOperation({ summary: "List entry history for a fixed expense" })
  findHistory(
    @Req() req: any,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findHistory(req.user.id, id);
  }
}
