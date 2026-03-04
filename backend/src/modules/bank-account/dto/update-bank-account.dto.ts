import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BankAccountType } from "../../../../generated/prisma/client.js";

export class UpdateBankAccountDto {
  @ApiProperty({ example: "Nubank Conta Corrente", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: "Nubank", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  institution?: string;

  @ApiProperty({ enum: BankAccountType, example: "checking", required: false })
  @IsOptional()
  @IsEnum(BankAccountType)
  type?: BankAccountType;
}
