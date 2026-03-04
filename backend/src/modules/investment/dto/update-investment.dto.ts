import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { InvestmentType, LiquidityType } from "../../../../generated/prisma/client.js";

export class UpdateInvestmentDto {
  @ApiProperty({ example: "Tesouro Selic 2029", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ enum: InvestmentType, example: "fixed_income", required: false })
  @IsOptional()
  @IsEnum(InvestmentType)
  type?: InvestmentType;

  @ApiProperty({ example: "Tesouro Direto", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  institution?: string;

  @ApiProperty({ enum: LiquidityType, example: "daily", required: false })
  @IsOptional()
  @IsEnum(LiquidityType)
  liquidity?: LiquidityType;

  @ApiProperty({ example: "2029-01-01", required: false })
  @IsOptional()
  @IsDateString()
  maturityDate?: string;
}
