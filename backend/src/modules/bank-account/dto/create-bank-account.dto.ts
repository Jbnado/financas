import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BankAccountType } from "../../../../generated/prisma/client.js";

export class CreateBankAccountDto {
  @ApiProperty({ example: "Nubank Conta Corrente" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "Nubank" })
  @IsString()
  @IsNotEmpty()
  institution!: string;

  @ApiProperty({ enum: BankAccountType, example: "checking" })
  @IsEnum(BankAccountType)
  type!: BankAccountType;

  @ApiProperty({ example: 5000, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;
}
