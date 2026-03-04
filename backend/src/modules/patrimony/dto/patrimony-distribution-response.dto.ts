import { ApiProperty } from "@nestjs/swagger";

export class DistributionItemDto {
  @ApiProperty({ example: "checking" }) type!: string;
  @ApiProperty({ example: "Conta Corrente" }) label!: string;
  @ApiProperty({ example: "5000.00" }) total!: string;
  @ApiProperty({ example: 7.69 }) percentage!: number;
}

export class PatrimonyDistributionResponseDto {
  @ApiProperty({ type: [DistributionItemDto] }) items!: DistributionItemDto[];
  @ApiProperty({ example: "65000.00" }) grandTotal!: string;
}
