import { IsString, IsNotEmpty, IsDateString, IsNumberString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBillingCycleDto {
  @ApiProperty({ example: "Fevereiro 2026" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "2026-01-25T00:00:00.000Z" })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: "2026-02-24T00:00:00.000Z" })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: "7300.00", description: "Salary as decimal string" })
  @IsNumberString()
  salary!: string;
}
