const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const WINNING_POSITION = 35;

const initialGameState = {
  players: [],
  currentPlayerIndex: 0,
  isQuizVisible: false,
  currentQuestion: null,
  diceValue: null,
  lastAnswerResult: null,
};

const rooms = {};

const createInitialGameState = () => JSON.parse(JSON.stringify(initialGameState));

const broadcastGameState = (room) => {
  if (!rooms[room]) return;
  io.to(room).emit('gameState', rooms[room].gameState);
};

io.on('connection', (socket) => {
  const room = socket.handshake.query.room || 'default';
  socket.join(room);

  if (!rooms[room]) {
    rooms[room] = {
      gameState: createInitialGameState(),
      clients: new Map(),
    };
  }

  const playerId = rooms[room].clients.size + 1;
  rooms[room].clients.set(socket.id, playerId);

  const playerColor = ['red', 'blue', 'green', 'yellow'][playerId - 1];
  if (rooms[room].gameState.players.length < 4) {
    rooms[room].gameState.players.push({ id: playerId, position: 0, score: 0, color: playerColor });
  }

  socket.emit('playerAssignment', { playerId });
  broadcastGameState(room);

  socket.on('rollDice', (payload) => {
    const gameState = rooms[room].gameState;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || payload.playerId !== currentPlayer.id) return;

    gameState.lastAnswerResult = null;
    gameState.diceValue = payload.diceValue;
    gameState.currentQuestion = payload.question;
    broadcastGameState(room);
  });

  socket.on('showQuestion', (payload) => {
    const gameState = rooms[room].gameState;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || payload.playerId !== currentPlayer.id) return;
    gameState.isQuizVisible = true;
    broadcastGameState(room);
  });

  socket.on('answerQuestion', (payload) => {
    const gameState = rooms[room].gameState;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || payload.playerId !== currentPlayer.id) return;

    const { isCorrect } = payload;
    const diceRoll = gameState.diceValue;
    let newPosition = currentPlayer.position;
    let newScore = currentPlayer.score;

    if (isCorrect) {
      newPosition = Math.min(WINNING_POSITION, currentPlayer.position + diceRoll);
      newScore += diceRoll;
    }

    gameState.lastAnswerResult = { playerId: currentPlayer.id, isCorrect };
    gameState.players[gameState.currentPlayerIndex] = { ...currentPlayer, position: newPosition, score: newScore };
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

    gameState.isQuizVisible = false;
    gameState.currentQuestion = null;
    gameState.diceValue = null;
    broadcastGameState(room);
  });

  socket.on('resetGame', () => {
    rooms[room].gameState = createInitialGameState();
    let i = 1;
    for (const [socketId, oldPlayerId] of rooms[room].clients.entries()) {
      const color = ['red', 'blue', 'green', 'yellow'][i - 1];
      rooms[room].gameState.players.push({ id: i, position: 0, score: 0, color });
      io.to(socketId).emit('playerAssignment', { playerId: i });
      rooms[room].clients.set(socketId, i);
      i++;
    }
    broadcastGameState(room);
  });

  socket.on('disconnect', () => {
    const disconnectedPlayerId = rooms[room].clients.get(socket.id);
    rooms[room].clients.delete(socket.id);
    rooms[room].gameState.players = rooms[room].gameState.players.filter(p => p.id !== disconnectedPlayerId);

    if (rooms[room].gameState.currentPlayerIndex >= rooms[room].gameState.players.length) {
      rooms[room].gameState.currentPlayerIndex = 0;
    }

    if (rooms[room].clients.size === 0) {
      delete rooms[room];
    } else {
      broadcastGameState(room);
    }
  });
});

httpServer.listen(8080, () => {
  console.log('Socket.IO server listening on port 8080');
});
