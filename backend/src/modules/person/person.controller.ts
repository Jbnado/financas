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
import { PersonService } from "./person.service.js";
import { CreatePersonDto } from "./dto/create-person.dto.js";
import { UpdatePersonDto } from "./dto/update-person.dto.js";
import { PersonResponseDto } from "./dto/person-response.dto.js";

@ApiTags("persons")
@ApiBearerAuth()
@Controller("persons")
export class PersonController {
  constructor(private readonly service: PersonService) {}

  @Post()
  @ApiOperation({ summary: "Create a new person" })
  @ApiResponse({ status: 201, type: PersonResponseDto })
  async create(@Req() req: Request, @Body() dto: CreatePersonDto) {
    const user = req.user as { id: string };
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List active persons" })
  @ApiResponse({ status: 200, type: [PersonResponseDto] })
  async findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.service.findAll(user.id);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a person" })
  @ApiResponse({ status: 200, type: PersonResponseDto })
  @ApiResponse({ status: 404, description: "Person not found" })
  async update(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    const user = req.user as { id: string };
    return this.service.update(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete a person" })
  @ApiResponse({ status: 200, type: PersonResponseDto })
  @ApiResponse({ status: 404, description: "Person not found" })
  async remove(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.remove(user.id, id);
  }
}
