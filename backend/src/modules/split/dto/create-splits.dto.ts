import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumberString,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class SplitItemDto {
  @ApiProperty({ description: "Person ID (UUID)" })
  @IsUUID()
  personId!: string;

  @ApiProperty({ description: "Amount as decimal string", example: "100.00" })
  @IsNumberString()
  amount!: string;
}

export class CreateSplitsDto {
  @ApiProperty({ type: [SplitItemDto], description: "Array of splits" })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SplitItemDto)
  splits!: SplitItemDto[];
}
