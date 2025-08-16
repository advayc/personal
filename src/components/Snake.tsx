import React, { useEffect, useRef, useState } from 'react';

interface SnakeProps {
  width: number;
  height: number;
  onGameEnd?: (score: number) => void;
}

interface Point { x: number; y: number; }

const CELL = 16;

const Snake: React.FC<SnakeProps> = ({ width, height, onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 });
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);

  const cols = Math.floor(width / CELL);
  const rows = Math.floor(height / CELL);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!running) return;
      switch (e.key) {
        case 'ArrowUp': if (dir.y !== 1) setDir({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (dir.y !== -1) setDir({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (dir.x !== 1) setDir({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (dir.x !== -1) setDir({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        // collisions
        if (
          head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows ||
          prev.some(p => p.x === head.x && p.y === head.y)
        ) {
          setRunning(false);
          onGameEnd?.(score);
          return prev;
        }
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          // new food
          let nf: Point;
          do {
            nf = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
          } while (newSnake.some(p => p.x === nf.x && p.y === nf.y));
          setFood(nf);
          return newSnake;
        } else {
          newSnake.pop();
          return newSnake;
        }
      });
    }, 120);
    return () => clearInterval(id);
  }, [dir, food, running, cols, rows, onGameEnd, score]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let x = 0; x < width; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke();
    }
    for (let y = 0; y < height; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke();
    }

    // food
    ctx.fillStyle = 'var(--accent-color)';
    ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

    // snake
    ctx.fillStyle = '#fff';
    snake.forEach((s,i) => {
      ctx.globalAlpha = 1 - i * 0.035;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.globalAlpha = 1;
  }, [snake, food, width, height]);

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} />
      {!running && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white space-y-3 font-mono">
          <div className="text-2xl tracking-tight">Game Over</div>
          <div className="text-sm">Score: {score}</div>
          <button
            onClick={() => { setSnake([{x:10,y:10}]); setDir({x:1,y:0}); setScore(0); setRunning(true); }}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-xs"
          >Restart</button>
        </div>
      )}
      <div className="absolute top-2 left-2 text-white/60 text-xs font-mono bg-black/40 px-2 py-1 rounded border border-white/10">Score {score}</div>
    </div>
  );
};

export default Snake;
