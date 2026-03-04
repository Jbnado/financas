import { ApiProperty } from "@nestjs/swagger";

export class EvolutionSnapshotDto {
  @ApiProperty({ example: "Jan 2026" }) cycleName!: string;
  @ApiProperty() snapshotDate!: string;
  @ApiProperty({ example: "60000.00" }) totalAssets!: string;
  @ApiProperty({ example: "52000.00" }) netPatrimony!: string;
}

export class PatrimonyEvolutionResponseDto {
  @ApiProperty({ type: [EvolutionSnapshotDto] }) snapshots!: EvolutionSnapshotDto[];
}
