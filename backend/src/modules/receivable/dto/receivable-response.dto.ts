import { ApiProperty } from "@nestjs/swagger";

export class ReceivableResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  splitId!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty()
  amount!: string;

  @ApiProperty()
  paidAmount!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ReceivableSummaryDto {
  @ApiProperty()
  personId!: string;

  @ApiProperty()
  personName!: string;

  @ApiProperty()
  totalPending!: string;

  @ApiProperty()
  totalPaid!: string;
}
