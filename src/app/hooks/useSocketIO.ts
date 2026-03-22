// src/app/hooks/useSocketIO.ts
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocketIO = (room: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (!room) return;

    const newSocket = io('http://localhost:8080', {
      query: { room },
    });

    newSocket.on('connect', () => {
      console.log('connected to socket.io server');
      setSocket(newSocket);
    });

    newSocket.on('gameState', (data) => {
      setGameState(data);
    });

    newSocket.on('playerAssignment', (data) => {
      setPlayerId(data.playerId);
    });

    newSocket.on('disconnect', () => {
      console.log('disconnected from socket.io server');
      setSocket(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [room]);

  const emit = (event: string, payload: any) => {
    if (socket) {
      socket.emit(event, payload);
    }
  };

  return { gameState, playerId, emit };
};

export default useSocketIO;
