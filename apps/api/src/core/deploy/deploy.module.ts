import { Module } from "@nestjs/common";
import { VercelProvider } from "./providers/vercel.provider";
import { RailwayProvider } from "./providers/railway.provider";

@Module({
  providers: [VercelProvider, RailwayProvider],
  exports: [VercelProvider, RailwayProvider],
})
export class DeployModule {}
