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
import { TaxService } from "./tax.service";
import { CreateTaxDto } from "./dto/create-tax.dto";
import { UpdateTaxDto } from "./dto/update-tax.dto";
import { CreateTaxEntryDto } from "./dto/create-tax-entry.dto";
import { TaxResponseDto, TaxEntryResponseDto, TaxWithEntryDto } from "./dto/tax-response.dto";

@ApiTags("taxes")
@ApiBearerAuth()
@Controller()
export class TaxController {
  constructor(private readonly service: TaxService) {}

  @Post("taxes")
  @ApiOperation({ summary: "Create tax" })
  @ApiResponse({ status: 201, type: TaxResponseDto })
  create(@Req() req: any, @Body() dto: CreateTaxDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get("taxes")
  @ApiOperation({ summary: "List active taxes" })
  @ApiResponse({ status: 200, type: [TaxResponseDto] })
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Put("taxes/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update tax" })
  @ApiResponse({ status: 200, type: TaxResponseDto })
  update(
    @Req() req: any,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaxDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete("taxes/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete tax" })
  @ApiResponse({ status: 200, type: TaxResponseDto })
  remove(@Req() req: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Post("taxes/:id/entries")
  @ApiOperation({ summary: "Create tax entry for a billing cycle" })
  @ApiResponse({ status: 201, type: TaxEntryResponseDto })
  createEntry(
    @Req() req: any,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateTaxEntryDto,
  ) {
    return this.service.createEntry(req.user.id, id, dto);
  }

  @Patch("tax-entries/:id/toggle-paid")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Toggle tax entry paid status" })
  @ApiResponse({ status: 200, type: TaxEntryResponseDto })
  togglePaid(@Req() req: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.toggleEntryPaid(req.user.id, id);
  }

  @Get("billing-cycles/:cycleId/taxes")
  @ApiOperation({ summary: "List taxes with entry for a cycle" })
  @ApiResponse({ status: 200, type: [TaxWithEntryDto] })
  findByCycle(
    @Req() req: any,
    @Param("cycleId", ParseUUIDPipe) cycleId: string,
  ) {
    return this.service.findByCycle(req.user.id, cycleId);
  }
}
