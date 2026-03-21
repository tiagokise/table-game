const { WebSocketServer, WebSocket } = require('ws');
const url = require('url');

const wss = new WebSocketServer({ port: 8080 });

const WINNING_POSITION = 35;

const initialGameState = {
  players: [],
  currentPlayerIndex: 0,
  isQuizVisible: false,
  currentQuestion: null,
  diceValue: null, // To store the dice value before the question is shown
};

const rooms = {};

// Function to create a fresh game state
const createInitialGameState = () => JSON.parse(JSON.stringify(initialGameState));

const broadcastGameState = (room) => {
  if (!rooms[room]) return;
  rooms[room].clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'gameState', payload: rooms[room].gameState }));
    }
  });
};

wss.on('connection', function connection(ws, req) {
  const { query } = url.parse(req.url, true);
  const room = query.room || 'default';

  if (!rooms[room]) {
    rooms[room] = {
      gameState: createInitialGameState(),
      clients: new Set(),
    };
  }

  const playerId = rooms[room].clients.size + 1;
  ws.playerId = playerId;
  rooms[room].clients.add(ws);

  const playerColor = ['red', 'blue', 'green', 'yellow'][playerId - 1];
  if (rooms[room].gameState.players.length < 4) {
    rooms[room].gameState.players.push({ id: playerId, position: 0, score: 0, color: playerColor });
  }

  ws.send(JSON.stringify({ type: 'playerAssignment', payload: { playerId } }));
  broadcastGameState(room);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const { type, payload } = JSON.parse(data);
    const gameState = rooms[room].gameState;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (!currentPlayer || payload.playerId !== currentPlayer.id) {
        return; // Not this player's turn or player doesn't exist
    }

    switch (type) {
      case 'rollDice':
        gameState.diceValue = payload.diceValue;
        gameState.currentQuestion = payload.question;
        broadcastGameState(room);
        break;

      case 'showQuestion':
        gameState.isQuizVisible = true;
        broadcastGameState(room);
        break;

      case 'answerQuestion':
        const { isCorrect } = payload;
        const diceRoll = gameState.diceValue;
        let newPosition = currentPlayer.position;
        let newScore = currentPlayer.score;

        if (isCorrect) {
          newPosition = currentPlayer.position + diceRoll;
          newScore = currentPlayer.score + diceRoll;
          if (newPosition >= WINNING_POSITION) {
            newPosition = WINNING_POSITION;
          }
        }

        gameState.players[gameState.currentPlayerIndex] = { ...currentPlayer, position: newPosition, score: newScore };
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        
        // Reset for next turn
        gameState.isQuizVisible = false;
        gameState.currentQuestion = null;
        gameState.diceValue = null;
        broadcastGameState(room);
        break;

      case 'resetGame':
        rooms[room].gameState = createInitialGameState();
        let i = 1;
        rooms[room].clients.forEach(client => {
            const color = ['red', 'blue', 'green', 'yellow'][i - 1];
            rooms[room].gameState.players.push({ id: i, position: 0, score: 0, color: color });
            client.playerId = i;
            client.send(JSON.stringify({ type: 'playerAssignment', payload: { playerId: i } }));
            i++;
        });
        broadcastGameState(room);
        break;

      default:
        break;
    }
  });

  ws.on('close', () => {
    rooms[room].clients.delete(ws);
    rooms[room].gameState.players = rooms[room].gameState.players.filter(p => p.id !== ws.playerId);
    
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
