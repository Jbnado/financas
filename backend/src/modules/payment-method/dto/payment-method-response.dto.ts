import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PaymentMethodResponseDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ example: "Nubank" })
  name!: string;

  @ApiProperty({ enum: ["credit", "debit"], example: "credit" })
  type!: string;

  @ApiPropertyOptional({ example: 15 })
  dueDay!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
