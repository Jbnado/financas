import { ApiProperty } from "@nestjs/swagger";

export class SplitResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  transactionId!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty()
  amount!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false })
  person?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  receivables?: {
    id: string;
    amount: string;
    paidAmount: string;
    status: string;
  }[];
}
