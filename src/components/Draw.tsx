import React, { useRef, useEffect } from 'react';

interface DrawProps {
  width: number;
  height: number;
  backgroundColor: string;
  activeTool: string; // 'brush' | 'fill' | 'eraser' | 'highlight' | 'text'
  activeColor: string;
  brushSize: number;
  onChange?: () => void;
  pushHistory: () => void;
  canDraw: boolean;
  onCanvas?: (canvas: HTMLCanvasElement | null) => void; // expose canvas to parent
}

// Basic flood fill implementation
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: [number, number, number, number]) {
  const canvas = ctx.canvas;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const getIndex = (px: number, py: number) => (py * width + px) * 4;

  const startIdx = getIndex(x, y);
  const startColor: [number, number, number, number] = [
    data[startIdx],
    data[startIdx + 1],
    data[startIdx + 2],
    data[startIdx + 3]
  ];

  // If target color is same as fill color, abort
  if (startColor[0] === fillColor[0] && startColor[1] === fillColor[1] && startColor[2] === fillColor[2] && startColor[3] === fillColor[3]) {
    return;
  }

  const matchStartColor = (idx: number) => (
    data[idx] === startColor[0] &&
    data[idx + 1] === startColor[1] &&
    data[idx + 2] === startColor[2] &&
    data[idx + 3] === startColor[3]
  );

  const stack: Array<[number, number]> = [[x, y]];

  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    let currentIdx = getIndex(cx, cy);
    if (!matchStartColor(currentIdx)) continue;

    // move up and down to find extent
    let up = cy;
    let down = cy;
    while (up >= 0 && matchStartColor(getIndex(cx, up))) up--;
    while (down < height && matchStartColor(getIndex(cx, down))) down++;

    for (let py = up + 1; py < down; py++) {
      currentIdx = getIndex(cx, py);
      data[currentIdx] = fillColor[0];
      data[currentIdx + 1] = fillColor[1];
      data[currentIdx + 2] = fillColor[2];
      data[currentIdx + 3] = fillColor[3];
      // check neighbors
      if (cx > 0 && matchStartColor(getIndex(cx - 1, py))) stack.push([cx - 1, py]);
      if (cx < width - 1 && matchStartColor(getIndex(cx + 1, py))) stack.push([cx + 1, py]);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

const Draw: React.FC<DrawProps> = ({ width, height, backgroundColor, activeTool, activeColor, brushSize, onChange, pushHistory, canDraw, onCanvas }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Resize / background handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // ensure background layer (we fill only once if empty)
    // we don't overwrite existing art when background changes; background color handled by container
    onCanvas?.(canvasRef.current);
  }, [backgroundColor, onCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: Math.floor((t.clientX - rect.left)), y: Math.floor((t.clientY - rect.top)) };
    }
    const me = e as React.MouseEvent;
    return { x: Math.floor((me.clientX - rect.left)), y: Math.floor((me.clientY - rect.top)) };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    if (activeTool === 'fill') {
      pushHistory();
      const rgba = hexToRgba(activeColor);
      floodFill(ctx, pos.x, pos.y, rgba);
      onChange?.();
      return;
    }
    if (activeTool === 'text') {
      // text handled by parent overlay; do not initiate drawing stroke
      return;
    }
    isDrawingRef.current = true;
    if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'highlight') {
      pushHistory();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      // Use compositing for a true eraser without color fringe artifacts
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)'; // color irrelevant in destination-out
        ctx.globalAlpha = 1;
      } else if (activeTool === 'highlight') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = 0.3; // translucent highlight
        ctx.lineWidth = brushSize * 3; // make highlight broader
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
  if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'highlight') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      onChange?.();
    }
  };

  const endDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      // Reset composite so future non-eraser operations behave normally
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
      }
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startDrawing(e);
  };
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    draw(e);
  };
  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    endDrawing();
  };

  return (
    <div
      className="relative rounded-md shadow-inner"
      style={{ width, height, background: backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="touch-none cursor-crosshair"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
};

function hexToRgba(hex: string): [number, number, number, number] {
  let c = hex.replace('#','');
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('');
  }
  const num = parseInt(c, 16);
  return [ (num >> 16) & 255, (num >> 8) & 255, num & 255, 255 ];
}

export default Draw;
