import { ApiProperty } from "@nestjs/swagger";

export class InvestmentResponseDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ example: "Tesouro Selic 2029" })
  name!: string;

  @ApiProperty({ example: "fixed_income" })
  type!: string;

  @ApiProperty({ example: "Tesouro Direto" })
  institution!: string;

  @ApiProperty({ example: 20000 })
  appliedAmount!: number;

  @ApiProperty({ example: 21500 })
  currentValue!: number;

  @ApiProperty({ example: "daily" })
  liquidity!: string;

  @ApiProperty({ example: "2029-01-01T00:00:00.000Z", nullable: true })
  maturityDate!: Date | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
