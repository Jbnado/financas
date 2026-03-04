import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumberString, IsOptional, IsUUID } from "class-validator";

export class CreateFixedExpenseEntryDto {
  @ApiProperty({ example: "uuid-billing-cycle-id" })
  @IsUUID()
  billingCycleId!: string;

  @ApiProperty({ example: "1450.00" })
  @IsNumberString()
  actualAmount!: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
