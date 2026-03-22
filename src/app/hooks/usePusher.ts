// src/app/hooks/usePusher.ts
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

const usePusher = (room: string | null) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [gameState, setGameState] = useState<any | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (!room) return;

    console.log("Pusher Key (from usePusher):", "cbefe2fef0f08ab319f4");
    console.log("Pusher Cluster (from usePusher):", "sa-east-1");

    const newPusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
      auth: {
        params: { room },
      },
    });

    const channelName = `presence-game-${room}`;
    const channel = newPusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setPlayerId(members.myID);
    });

    channel.bind('gameState', (data: any) => {
      setGameState(data);
    });

    setPusher(newPusher);

    return () => {
      newPusher.unsubscribe(channelName);
      newPusher.disconnect();
    };
  }, [room]);

  const emit = async (event: string, payload: any) => {
    await fetch('/api/pusher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, channel: `presence-game-${room}`, payload }),
    });
  };

  return { gameState, playerId, emit };
};

export default usePusher;
