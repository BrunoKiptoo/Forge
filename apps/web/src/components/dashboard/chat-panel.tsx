"use client";

import { useState } from "react";
import { chatMessages } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

export function ChatPanel() {
  const [messages] = useState(chatMessages);

  return (
    <Card className="bg-card/40 border-border/50 flex flex-col h-[400px]">
      <CardHeader className="flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-base font-semibold">Chat</CardTitle>
        <span className="text-xs text-muted-foreground font-mono">Agent Online</span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
              >
                <Avatar size="sm" className="shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold",
                      msg.role === "agent" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {msg.role === "agent" ? "AG" : "ZA"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm max-w-[85%]",
                    msg.role === "agent"
                      ? "bg-muted rounded-tl-sm"
                      : "bg-primary/10 text-foreground rounded-tr-sm",
                  )}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex gap-2">
            <Input placeholder="Type a message..." className="h-9 text-sm bg-muted/50" />
            <Button size="default" className="shrink-0">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
