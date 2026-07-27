import { Module } from "@nestjs/common";
import { BrowserCoreService } from "./browser.service";

@Module({
  providers: [BrowserCoreService],
  exports: [BrowserCoreService],
})
export class BrowserModule {}
