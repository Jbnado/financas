import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethodType } from "../../../../generated/prisma/enums.js";

export class CreatePaymentMethodDto {
  @ApiProperty({ example: "Nubank" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: PaymentMethodType, example: "credit" })
  @IsEnum(PaymentMethodType)
  type!: PaymentMethodType;

  @ApiPropertyOptional({ example: 15, description: "Due day (1-31)" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;
}
