import { IsOptional, IsUUID, IsBooleanString, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class TransactionFiltersDto {
  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID("4")
  categoryId?: string;

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID("4")
  paymentMethodId?: string;

  @ApiPropertyOptional({ example: "true" })
  @IsOptional()
  @IsBooleanString()
  isPaid?: string;

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID("4")
  personId?: string;

  @ApiPropertyOptional({ example: "Supermercado" })
  @IsOptional()
  @IsString()
  search?: string;
}
