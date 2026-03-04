import { IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateValueDto {
  @ApiProperty({ example: 21500 })
  @IsNumber()
  @Min(0)
  currentValue!: number;
}
