import { PartialType } from "@nestjs/swagger";
import { CreatePaymentMethodDto } from "./create-payment-method.dto.js";

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}
