import { Module } from "@nestjs/common";
import { ForgeGateway } from "./forge.gateway";

@Module({
  providers: [ForgeGateway],
  exports: [ForgeGateway],
})
export class GatewayModule {}
