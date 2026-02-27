import { ApiProperty } from "@nestjs/swagger";

export class CategoryResponseDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ example: "Alimentação" })
  name!: string;

  @ApiProperty({ example: "utensils", nullable: true })
  icon!: string | null;

  @ApiProperty({ example: "#f97316", nullable: true })
  color!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
