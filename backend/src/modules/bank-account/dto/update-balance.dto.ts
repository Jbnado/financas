import { IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateBalanceDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  balance!: number;
}
