import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { InvestmentType, LiquidityType } from "../../../../generated/prisma/client.js";

export class CreateInvestmentDto {
  @ApiProperty({ example: "Tesouro Selic 2029" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: InvestmentType, example: "fixed_income" })
  @IsEnum(InvestmentType)
  type!: InvestmentType;

  @ApiProperty({ example: "Tesouro Direto" })
  @IsString()
  @IsNotEmpty()
  institution!: string;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  @Min(0)
  appliedAmount!: number;

  @ApiProperty({ example: 21500 })
  @IsNumber()
  @Min(0)
  currentValue!: number;

  @ApiProperty({ enum: LiquidityType, example: "daily" })
  @IsEnum(LiquidityType)
  liquidity!: LiquidityType;

  @ApiProperty({ example: "2029-01-01", required: false })
  @IsOptional()
  @IsDateString()
  maturityDate?: string;
}
