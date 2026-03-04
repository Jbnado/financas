import { ApiProperty } from "@nestjs/swagger";

export class PatrimonySummaryResponseDto {
  @ApiProperty({ example: "15000.00" }) totalBankAccounts!: string;
  @ApiProperty({ example: "50000.00" }) totalInvestments!: string;
  @ApiProperty({ example: "65000.00" }) totalAssets!: string;
  @ApiProperty({ example: "8000.00" }) futureInstallments!: string;
  @ApiProperty({ example: "57000.00" }) netPatrimony!: string;
}
