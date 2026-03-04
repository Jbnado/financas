import { ApiProperty } from "@nestjs/swagger";

export class PersonResponseDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ example: "Fulano" })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: "uuid" })
  userId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
