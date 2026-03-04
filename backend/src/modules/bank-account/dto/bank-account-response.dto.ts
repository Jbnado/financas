import { ApiProperty } from "@nestjs/swagger";

export class BankAccountResponseDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ example: "Nubank Conta Corrente" })
  name!: string;

  @ApiProperty({ example: "Nubank" })
  institution!: string;

  @ApiProperty({ example: "checking" })
  type!: string;

  @ApiProperty({ example: 5000 })
  balance!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
