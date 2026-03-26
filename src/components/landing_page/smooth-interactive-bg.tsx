"use client";

import { useEffect, useRef } from 'react';

export function SmoothInteractiveBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Thread class
    class Thread {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number = 0;
      vy: number = 0;
      connections: Thread[] = [];

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
      }

      update(mouseX: number, mouseY: number) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Enhanced interaction radius
        if (dist < 220) {
          const force = (220 - dist) / 220;
          const angle = Math.atan2(dy, dx);
          this.vx -= Math.cos(angle) * force * 3;
          this.vy -= Math.sin(angle) * force * 3;
        }

        // Spring back to original position
        const springX = (this.targetX - this.x) * 0.04;
        const springY = (this.targetY - this.y) * 0.04;
        this.vx += springX;
        this.vy += springY;

        // Damping for smooth motion
        this.vx *= 0.88;
        this.vy *= 0.88;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw connections
        this.connections.forEach((thread) => {
          const dist = Math.sqrt(
            Math.pow(thread.x - this.x, 2) + Math.pow(thread.y - this.y, 2)
          );
          const opacity = Math.max(0, Math.min(0.04, 1 - dist / 180));

          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(thread.x, thread.y);
          ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Draw node
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fill();
      }
    }

    // Create grid
    const threads: Thread[] = [];
    const spacing = 100;
    const cols = Math.ceil(canvas.width / spacing) + 1;
    const rows = Math.ceil(canvas.height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        threads.push(new Thread(i * spacing, j * spacing));
      }
    }

    // Connect nearby threads
    threads.forEach((thread) => {
      threads.forEach((other) => {
        if (thread !== other) {
          const dx = thread.targetX - other.targetX;
          const dy = thread.targetY - other.targetY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < spacing * 1.5) {
            thread.connections.push(other);
          }
        }
      });
    });

    // Smooth mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.targetX = e.clientX;
      mousePosRef.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop with smooth interpolation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse position interpolation
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.15;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.15;

      threads.forEach((thread) => {
        thread.update(mousePosRef.current.x, mousePosRef.current.y);
        thread.draw(ctx);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ opacity: 1 }}
    />
  );
}