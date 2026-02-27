import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  ValidateIf,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethodType } from "../../../../generated/prisma/enums.js";

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional({ example: "Nubank" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ enum: PaymentMethodType, example: "credit" })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @ApiPropertyOptional({
    example: 15,
    description: "Due day (1-31), send null to clear",
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number | null;
}
