// src/app/hooks/useWebSocket.ts
import { useState, useEffect, useRef } from 'react';

const useWebSocket = (room: string | null) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!room) return;

    const ws = new WebSocket(`ws://localhost:8080?room=${room}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onclose = () => {
      console.log('disconnected');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [room]);

  const sendMessage = (message: any) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return { messages, sendMessage };
};

export default useWebSocket;
