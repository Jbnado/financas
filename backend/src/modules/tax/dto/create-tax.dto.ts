import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class CreateTaxDto {
  @ApiProperty({ example: "DAS" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "6.00" })
  @IsNumberString()
  rate!: string;

  @ApiProperty({ example: "500.00" })
  @IsNumberString()
  estimatedAmount!: string;
}
