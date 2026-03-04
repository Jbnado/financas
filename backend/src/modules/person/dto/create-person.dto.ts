import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePersonDto {
  @ApiProperty({ example: "Fulano" })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
