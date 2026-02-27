import { ApiProperty } from "@nestjs/swagger";

export class BillingCycleSummaryDto {
  @ApiProperty({ example: "7300.00" })
  salary!: string;

  @ApiProperty({ example: "0.00" })
  totalCards!: string;

  @ApiProperty({ example: "0.00" })
  totalFixed!: string;

  @ApiProperty({ example: "0.00" })
  totalTaxes!: string;

  @ApiProperty({ example: "0.00" })
  totalReceivables!: string;

  @ApiProperty({ example: "7300.00" })
  netResult!: string;
}

export class BillingCycleResponseDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ example: "Fevereiro 2026" })
  name!: string;

  @ApiProperty()
  startDate!: Date;

  @ApiProperty()
  endDate!: Date;

  @ApiProperty({ example: "7300.00" })
  salary!: string;

  @ApiProperty({ enum: ["open", "closed"] })
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class BillingCycleDetailResponseDto extends BillingCycleResponseDto {
  @ApiProperty({ type: BillingCycleSummaryDto })
  summary!: BillingCycleSummaryDto;
}
