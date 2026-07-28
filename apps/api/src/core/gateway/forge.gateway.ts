import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/ws" })
export class ForgeGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage("join")
  handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    void client.join(room);
  }

  @SubscribeMessage("leave")
  handleLeave(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    void client.leave(room);
  }

  emit(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data);
  }
}
