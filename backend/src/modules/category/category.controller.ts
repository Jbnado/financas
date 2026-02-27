import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import type { Request } from "express";
import { CategoryService } from "./category.service.js";
import { CreateCategoryDto } from "./dto/create-category.dto.js";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";
import { CategoryResponseDto } from "./dto/category-response.dto.js";

@ApiTags("categories")
@ApiBearerAuth()
@Controller("categories")
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Post()
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  async create(@Req() req: Request, @Body() dto: CreateCategoryDto) {
    const user = req.user as { id: string };
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List categories" })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    type: String,
    description: "Set to 'true' to include inactive categories",
  })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async findAll(
    @Req() req: Request,
    @Query("includeInactive") includeInactive?: string,
  ) {
    const user = req.user as { id: string };
    return this.service.findAll(user.id, includeInactive === "true");
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a category" })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: "Category not found" })
  async update(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const user = req.user as { id: string };
    return this.service.update(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete a category" })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: "Category not found" })
  async remove(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = req.user as { id: string };
    return this.service.remove(user.id, id);
  }
}
