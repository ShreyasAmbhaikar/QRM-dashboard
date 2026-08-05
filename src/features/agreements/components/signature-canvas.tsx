'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Edit3, Type, RotateCcw, Check } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (signatureDataUrl: string, name: string) => void;
  defaultName?: string;
  roleName: string;
}

export function SignatureCanvas({ onSave, defaultName = '', roleName }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState(defaultName);
  const [selectedFont, setSelectedFont] = useState('font-signature-1');
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw');

  // Initialize Canvas resize and drawing context
  useEffect(() => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set standard display resolution size safely
      const parentWidth = canvas.parentElement?.clientWidth;
      canvas.width = parentWidth && parentWidth > 0 ? parentWidth : 400;
      canvas.height = 180;

      ctx.strokeStyle = '#581c87'; // Elegant Deep Purple
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeTab]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling when drawing on touch screens
    if (e.cancelable) e.preventDefault();

    const pos = getCoordinates(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    
    // Check if TouchEvent
    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Convert current signature input (drawn or typed) to base64 image URL
  const handleSave = () => {
    let signatureDataUrl = '';
    const nameToSave = typedName.trim() || defaultName || 'Signed Party';

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Check if canvas is empty before saving
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        alert('Please draw your signature before saving.');
        return;
      }
      signatureDataUrl = canvas.toDataURL();
    } else {
      if (!typedName.trim()) {
        alert('Please type your name for the signature.');
        return;
      }
      
      // Render typed text inside a temporary canvas to output a PNG
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 450;
      tempCanvas.height = 150;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Match chosen font
        let fontStyle = '48px "Dancing Script", cursive';
        if (selectedFont === 'font-signature-2') fontStyle = '48px "Great Vibes", cursive';
        if (selectedFont === 'font-signature-3') fontStyle = '40px "Alex Brush", cursive';

        tempCtx.font = fontStyle;
        tempCtx.fillStyle = '#581c87'; // Elegant Deep Purple signature ink
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(typedName, tempCanvas.width / 2, tempCanvas.height / 2);
        
        signatureDataUrl = tempCanvas.toDataURL();
      }
    }

    onSave(signatureDataUrl, nameToSave);
  };

  return (
    <Card className="p-4 border-border bg-card shadow-lg max-w-lg mx-auto space-y-4">
      {/* Import the elegant signature Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script:wght@500&family=Great+Vibes&display=swap"
        rel="stylesheet"
      />

      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
          <Edit3 className="h-4 w-4" /> Sign as {roleName}
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          Legal Signature
        </span>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground">Signee Full Name</label>
        <Input
          placeholder="Enter signee name (e.g. Dr. Chintan Gujarathi)"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          className="h-9 text-xs text-foreground"
        />
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-muted/20 border border-border p-1 rounded-xl w-full gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('draw')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'draw'
              ? 'bg-purple-700 text-white shadow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" /> Draw Signature
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('type')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'type'
              ? 'bg-purple-700 text-white shadow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Type className="h-3.5 w-3.5" /> Type Signature
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'draw' ? (
        <div className="space-y-3">
          <div className="relative border border-border border-dashed rounded-lg overflow-hidden bg-muted/10 h-[180px]">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={clearCanvas}
              className="absolute top-2 right-2 h-7 w-7 bg-background shadow-md border-border text-muted-foreground hover:text-primary"
              title="Clear signature pad"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Draw your signature inside the box using your mouse, trackpad, or touchscreen.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 border border-border rounded-lg bg-muted/10 min-h-[140px] flex items-center justify-center relative overflow-hidden">
            {typedName ? (
              <span
                className={`text-4xl text-purple-700 transition-all select-none ${
                  selectedFont === 'font-signature-1'
                    ? 'font-sig-dancing'
                    : selectedFont === 'font-signature-2'
                    ? 'font-sig-greatvibes'
                    : 'font-sig-alexbrush'
                }`}
              >
                {typedName}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">Signature preview will appear here</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Choose Signature Font Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedFont === 'font-signature-1' ? 'secondary' : 'outline'}
                className="h-8 text-xs font-sig-dancing font-normal text-foreground"
                onClick={() => setSelectedFont('font-signature-1')}
              >
                Dancing Script
              </Button>
              <Button
                type="button"
                variant={selectedFont === 'font-signature-2' ? 'secondary' : 'outline'}
                className="h-8 text-xs font-sig-greatvibes font-normal text-foreground text-sm"
                onClick={() => setSelectedFont('font-signature-2')}
              >
                Great Vibes
              </Button>
              <Button
                type="button"
                variant={selectedFont === 'font-signature-3' ? 'secondary' : 'outline'}
                className="h-8 text-xs font-sig-alexbrush font-normal text-foreground text-sm"
                onClick={() => setSelectedFont('font-signature-3')}
              >
                Alex Brush
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <Button type="button" onClick={handleSave} className="gap-1.5 shadow bg-purple-700 hover:bg-purple-800 text-white">
          <Check className="h-4 w-4" /> Save & Adopt Signature
        </Button>
      </div>

      <style jsx>{`
        .font-sig-dancing {
          font-family: 'Dancing Script', cursive;
        }
        .font-sig-greatvibes {
          font-family: 'Great Vibes', cursive;
        }
        .font-sig-alexbrush {
          font-family: 'Alex Brush', cursive;
        }
      `}</style>
    </Card>
  );
}
