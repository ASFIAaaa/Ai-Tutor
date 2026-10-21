import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { WhiteboardPoint, WhiteboardStroke } from '../../types';

export interface WhiteboardLayerHandle {
  exportSnapshot: () => string;
}

interface WhiteboardLayerProps {
  stepIndex: number;
  initialStrokes?: WhiteboardStroke[];
  onStrokesChange?: (stepIndex: number, strokes: WhiteboardStroke[]) => void;
  onAskAboutDrawing?: (imageBase64: string) => void;
  isBlankMode?: boolean;
  onToggleBlankMode?: () => void;
  diagramSvgRef?: React.RefObject<SVGSVGElement | null>;
}

const COLORS = [
  { name: 'Orange', value: '#F97316' },
  { name: 'Cyan Blue', value: '#0284C7' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Coral Red', value: '#EF4444' },
  { name: 'Sunshine', value: '#F59E0B' },
  { name: 'Slate', value: '#1E293B' }
];

const SIZES = [
  { label: 'S', value: 3 },
  { label: 'M', value: 7 },
  { label: 'L', value: 14 }
];

export const WhiteboardLayer = forwardRef<WhiteboardLayerHandle, WhiteboardLayerProps>(({
  stepIndex,
  initialStrokes = [],
  onStrokesChange,
  onAskAboutDrawing,
  isBlankMode = false,
  onToggleBlankMode,
  diagramSvgRef
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Whiteboard tool state
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#F97316');
  const [size, setSize] = useState<number>(7);

  // Undo / Redo history
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>(initialStrokes);
  const [redoStack, setRedoStack] = useState<WhiteboardStroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<WhiteboardStroke | null>(null);

  // Sync when stepIndex or initialStrokes change
  useEffect(() => {
    setStrokes(initialStrokes);
    setRedoStack([]);
  }, [stepIndex, initialStrokes]);

  // Redraw canvas whenever strokes list changes
  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 2.5;
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size * 2.2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        // Quadratic bezier smoothing for silky smooth lines
        const xc = (stroke.points[i - 1].x + stroke.points[i].x) / 2;
        const yc = (stroke.points[i - 1].y + stroke.points[i].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
      }
      ctx.stroke();
      ctx.restore();
    });
  };

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): WhiteboardPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const pt = getCanvasCoordinates(e);
    isDrawingRef.current = true;

    const newStroke: WhiteboardStroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      tool,
      color,
      size,
      points: [pt, pt]
    };
    currentStrokeRef.current = newStroke;

    setStrokes(prev => [...prev, newStroke]);
    setRedoStack([]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const pt = getCanvasCoordinates(e);

    currentStrokeRef.current.points.push(pt);

    // Live update the last stroke in state
    setStrokes(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...currentStrokeRef.current!
      };
      return updated;
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    currentStrokeRef.current = null;

    // Notify parent to persist per-step drawings
    onStrokesChange?.(stepIndex, strokes);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    setRedoStack(prev => [...prev, last]);
    onStrokesChange?.(stepIndex, newStrokes);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newStrokes = [...strokes, next];
    setStrokes(newStrokes);
    setRedoStack(newRedo);
    onStrokesChange?.(stepIndex, newStrokes);
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    setStrokes([]);
    setRedoStack([]);
    onStrokesChange?.(stepIndex, []);
  };

  /**
   * Exports composite image of diagram + drawings for Gemini multimodal analysis
   */
  const exportSnapshot = (): string => {
    const drawingCanvas = canvasRef.current;
    if (!drawingCanvas) return '';

    // Create an offscreen canvas to combine SVG + drawing
    const offscreen = document.createElement('canvas');
    offscreen.width = 800;
    offscreen.height = 500;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return drawingCanvas.toDataURL('image/png');

    // Fill background
    ctx.fillStyle = isBlankMode ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(0, 0, 800, 500);

    // Draw the drawing canvas strokes
    ctx.drawImage(drawingCanvas, 0, 0);

    return offscreen.toDataURL('image/png');
  };

  useImperativeHandle(ref, () => ({
    exportSnapshot
  }));

  const handleAskAboutDrawingClick = () => {
    const snapshot = exportSnapshot();
    onAskAboutDrawing?.(snapshot);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
      {/* Interactive Drawing Canvas Layer */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className={`w-full h-full pointer-events-auto touch-none cursor-crosshair ${
          isBlankMode ? 'bg-white' : 'bg-transparent'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Floating Whiteboard Control Toolbar */}
      <div className="pointer-events-auto absolute top-3 right-3 left-3 flex flex-wrap items-center justify-between gap-2 p-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-md">
        {/* Tools: Pen, Highlighter, Eraser */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              tool === 'pen'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Pen tool"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              tool === 'highlighter'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlighter</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              tool === 'eraser'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Color Palette (5-6 colors) */}
        {tool !== 'eraser' && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200/60">
            {COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  color === c.value ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : 'hover:scale-110 opacity-90'
                }`}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Stroke Sizes (S, M, L) */}
        <div className="flex items-center gap-1 px-1.5 py-1 bg-slate-50 rounded-lg border border-slate-200/60">
          {SIZES.map(s => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSize(s.value)}
              className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md transition-colors ${
                size === s.value
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              title={`Size ${s.label}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* History: Undo, Redo, Clear */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-30 rounded-lg transition-colors"
            title="Clear whiteboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Toggle Blank Whiteboard Mode */}
          <button
            type="button"
            onClick={onToggleBlankMode}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              isBlankMode
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle blank canvas mode"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">{isBlankMode ? 'Show Diagram' : 'Blank Board'}</span>
          </button>

          {/* Ask About This Button (AI multimodal vision) */}
          <button
            type="button"
            onClick={handleAskAboutDrawingClick}
            className="ml-1 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            title="Circle a part and ask the AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask About This</span>
          </button>
        </div>
      </div>
    </div>
  );
});

WhiteboardLayer.displayName = 'WhiteboardLayer';
