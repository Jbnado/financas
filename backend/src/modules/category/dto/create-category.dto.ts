import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({ example: "Alimentação" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "utensils", required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: "#f97316", required: false })
  @IsOptional()
  @IsString()
  color?: string;
}
