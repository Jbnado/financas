import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TransactionResponseDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ example: "Supermercado" })
  description!: string;

  @ApiProperty({ example: "125.50" })
  amount!: string;

  @ApiProperty({ example: "2026-03-01T00:00:00.000Z" })
  date!: Date;

  @ApiProperty({ example: false })
  isPaid!: boolean;

  @ApiPropertyOptional({ example: 1 })
  installmentNumber!: number | null;

  @ApiPropertyOptional({ example: 3 })
  totalInstallments!: number | null;

  @ApiProperty({ example: "uuid" })
  userId!: string;

  @ApiProperty({ example: "uuid" })
  billingCycleId!: string;

  @ApiProperty({ example: "uuid" })
  categoryId!: string;

  @ApiProperty({ example: "uuid" })
  paymentMethodId!: string;

  @ApiPropertyOptional({ example: "uuid" })
  parentTransactionId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
