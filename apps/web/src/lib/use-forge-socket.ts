"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getApiUrl, getAccessToken } from "./api";

let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(`${getApiUrl()}/ws`, {
      auth: { token: getAccessToken() ?? "" },
      transports: ["websocket"],
    });
  }
  return _socket;
}

export function useForgeSocket(
  rooms: string[],
  handlers: Record<string, (data: unknown) => void>,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = getSocket();

    rooms.forEach((r) => socket.emit("join", r));

    const off = Object.entries(handlersRef.current).map(([event, fn]) => {
      const handler = (data: unknown) => fn(data);
      socket.on(event, handler);
      return () => socket.off(event, handler);
    });

    return () => {
      off.forEach((fn) => fn());
      rooms.forEach((r) => socket.emit("leave", r));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.join(",")]);
}
