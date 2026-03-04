import { ApiProperty } from "@nestjs/swagger";

export class FixedExpenseResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() estimatedAmount!: string;
  @ApiProperty() dueDay!: number;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() userId!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class FixedExpenseEntryResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() fixedExpenseId!: string;
  @ApiProperty() billingCycleId!: string;
  @ApiProperty() actualAmount!: string;
  @ApiProperty() isPaid!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class FixedExpenseWithEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() estimatedAmount!: string;
  @ApiProperty() dueDay!: number;
  @ApiProperty() entry!: FixedExpenseEntryResponseDto | null;
}
