import { ApiProperty } from "@nestjs/swagger";

export class TaxResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() rate!: string;
  @ApiProperty() estimatedAmount!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() userId!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class TaxEntryResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() taxId!: string;
  @ApiProperty() billingCycleId!: string;
  @ApiProperty() actualAmount!: string;
  @ApiProperty() isPaid!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class TaxWithEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() rate!: string;
  @ApiProperty() estimatedAmount!: string;
  @ApiProperty() entry!: TaxEntryResponseDto | null;
}
