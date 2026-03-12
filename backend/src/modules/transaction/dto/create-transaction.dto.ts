import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumberString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  Max,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@ValidatorConstraint({ name: "isPositiveNumberString", async: false })
class IsPositiveNumberString implements ValidatorConstraintInterface {
  validate(value: string) {
    return typeof value === "string" && !isNaN(Number(value)) && Number(value) > 0;
  }
  defaultMessage() {
    return "amount must be a positive number";
  }
}

export class CreateTransactionDto {
  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Client-generated UUID v4 for idempotency",
  })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ example: "Supermercado" })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: "125.50", description: "Amount as positive decimal string" })
  @IsNumberString()
  @IsNotEmpty()
  @Validate(IsPositiveNumberString)
  amount!: string;

  @ApiProperty({ example: "2026-03-01T00:00:00.000Z" })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: "uuid" })
  @IsUUID("4")
  billingCycleId!: string;

  @ApiProperty({ example: "uuid" })
  @IsUUID("4")
  categoryId!: string;

  @ApiProperty({ example: "uuid" })
  @IsUUID("4")
  paymentMethodId!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  installmentNumber?: number;

  @ApiPropertyOptional({ example: 3, description: "Number of installments (2-48)" })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(48)
  totalInstallments?: number;

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID("4")
  parentTransactionId?: string;
}
