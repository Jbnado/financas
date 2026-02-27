import { PartialType } from "@nestjs/swagger";
import { CreateBillingCycleDto } from "./create-billing-cycle.dto.js";

export class UpdateBillingCycleDto extends PartialType(CreateBillingCycleDto) {}
