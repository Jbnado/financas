import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumberString, IsString, Max, Min } from "class-validator";

export class CreateFixedExpenseDto {
  @ApiProperty({ example: "Aluguel" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "1500.00" })
  @IsNumberString()
  estimatedAmount!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay!: number;
}
