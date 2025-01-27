import React, { useEffect, useRef, useState } from 'react';

interface PongProps {
  width: number;
  height: number;
  onGameEnd: (winner: string) => void;
}

const Pong: React.FC<PongProps> = ({ width, height, onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(true);
  const [accentColor, setAccentColor] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const WINNING_SCORE = 10;

  // Game state
  const paddleHeight = 80;
  const paddleWidth = 12;
  const ballSize = 12;
  const paddleSpeed = 10;
  const aiSpeed = 5;
  const initialBallSpeed = 3;

  // Use refs for scores to ensure immediate updates
  const scores = useRef({ player: 0, ai: 0 });
  const gameState = useRef({
    playerY: height / 2 - paddleHeight / 2,
    aiY: height / 2 - paddleHeight / 2,
    ballX: width / 2,
    ballY: height / 2,
    ballSpeedX: initialBallSpeed,
    ballSpeedY: initialBallSpeed,
    keys: { up: false, down: false }
  });

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent-color').trim();
    setAccentColor(color);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;
      e.preventDefault();
      
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        gameState.current.keys.up = true;
      }
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        gameState.current.keys.down = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') gameState.current.keys.up = false;
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') gameState.current.keys.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;
    const gameLoop = () => {
      if (!paused && gameStarted) {
        updateGame();
      }
      drawGame(ctx);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, paused, gameStarted]);

  useEffect(() => {
    if (scores.current.player >= WINNING_SCORE || scores.current.ai >= WINNING_SCORE) {
      setPaused(true);
      onGameEnd(scores.current.player > scores.current.ai ? 'Player' : 'AI');
      // Reset scores after game ends
      scores.current = { player: 0, ai: 0 };
    }
  }, [scores.current.player, scores.current.ai, onGameEnd]);

  const updateGame = () => {
    const state = gameState.current;
    
    if (!paused && gameStarted) {
      state.ballX += state.ballSpeedX * speedMultiplier;
      state.ballY += state.ballSpeedY * speedMultiplier;

      // Ball collision with top and bottom
      if (state.ballY <= 0 || state.ballY + ballSize >= height) {
        state.ballSpeedY *= -1;
      }

      // Ball collision with paddles
      const ballCenterY = state.ballY + ballSize / 2;
      if (
        (state.ballX <= paddleWidth && 
         ballCenterY >= state.playerY && 
         ballCenterY <= state.playerY + paddleHeight) ||
        (state.ballX + ballSize >= width - paddleWidth && 
         ballCenterY >= state.aiY && 
         ballCenterY <= state.aiY + paddleHeight)
      ) {
        state.ballSpeedX *= -1.1;
        setSpeedMultiplier(prev => Math.min(prev + 0.1, 2.0));
      }

      // Scoring
      if (state.ballX <= 0) {
        scores.current.ai += 1;
        resetBall();
      } else if (state.ballX >= width) {
        scores.current.player += 1;
        resetBall();
      }

      // AI logic
      const aiTarget = state.ballY + ballSize / 2 - paddleHeight / 2;
      const randomDelay = Math.random() * 0.7;
      
      if (state.ballSpeedX > 0) {
        if (state.aiY < aiTarget - paddleHeight / 3) {
          state.aiY += aiSpeed * (1 - randomDelay);
        } else if (state.aiY > aiTarget + paddleHeight / 3) {
          state.aiY -= aiSpeed * (1 - randomDelay);
        }
      }
    }

    // Update paddle positions
    if (state.keys.up && state.playerY > 0) {
      state.playerY -= paddleSpeed;
    }
    if (state.keys.down && state.playerY < height - paddleHeight) {
      state.playerY += paddleSpeed;
    }
  };

  const resetBall = () => {
    const state = gameState.current;
    state.ballX = width / 2;
    state.ballY = height / 2;
    state.ballSpeedX = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    state.ballSpeedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    setSpeedMultiplier(1);
  };

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    const state = gameState.current;

    // Clear canvas
    ctx.fillStyle = '#151515';
    ctx.fillRect(0, 0, width, height);

    // Draw center line
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw scores
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(scores.current.player.toString(), width * 0.25, 40);
    ctx.fillText(scores.current.ai.toString(), width * 0.75, 40);

    // Draw paddles
    ctx.fillStyle = '#FFFFFF';
    // Player paddle
    ctx.beginPath();
    ctx.roundRect(0, state.playerY, paddleWidth, paddleHeight, [0, 4, 4, 0]);
    ctx.fill();
    // AI paddle
    ctx.beginPath();
    ctx.roundRect(width - paddleWidth, state.aiY, paddleWidth, paddleHeight, [4, 0, 0, 4]);
    ctx.fill();

    // Draw ball with glow effect
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(state.ballX + ballSize / 2, state.ballY + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw overlay if paused or not focused
    if (!isFocused || paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PONG', width / 2, height / 2 - 60);
      
      ctx.font = '20px monospace';
      ctx.fillStyle = accentColor;
      ctx.fillText('Click to play', width / 2, height / 2);
      
      ctx.font = '16px monospace';
      ctx.fillStyle = '#888888';
      ctx.fillText('Use W/S or ↑/↓ to move', width / 2, height / 2 + 40);
    }

    // Draw game over screen if someone won
    if (scores.current.player >= WINNING_SCORE || scores.current.ai >= WINNING_SCORE) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      const finalText = scores.current.player > scores.current.ai ? 'You Won!' : 'Game Over';
      ctx.fillText(finalText, width / 2, height / 2 - 30);
      
      ctx.font = '20px monospace';
      ctx.fillStyle = accentColor;
      ctx.fillText(`Final Score: ${scores.current.player} - ${scores.current.ai}`, width / 2, height / 2 + 20);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-pointer outline-none focus:outline-none"
        onClick={() => {
          setIsFocused(true);
          setPaused(false);
          setGameStarted(true);
          canvasRef.current?.focus();
        }}
        onBlur={() => setIsFocused(false)}
        tabIndex={-1}
      />
    </div>
  );
};

export default Pong;