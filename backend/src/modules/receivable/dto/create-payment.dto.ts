import { IsNumberString, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentDto {
  @ApiProperty({ description: "Payment amount as decimal string", example: "50.00" })
  @IsNumberString()
  amount!: string;

  @ApiProperty({ description: "Date of payment (ISO 8601)", example: "2026-03-04" })
  @IsDateString()
  paidAt!: string;
}
