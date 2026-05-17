import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  density: number;
  color: string;
}

interface ParticleTextProps {
  name: string;
}

const ParticleText = ({ name }: ParticleTextProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 85 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const initParticles = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight || 200;

      // Adjust for High-DPI screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      particles = [];

      // Offscreen canvas to render pristine text for pixel analysis
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const oCtx = offscreen.getContext("2d");
      if (!oCtx) return;

      oCtx.fillStyle = "#ffffff";
      let font = "bold 86px Inter, sans-serif";
      let lines = [name];
      let startY = height / 2 + 10;
      let lineSpacing = 52;

      // Responsive font sizes and layouts (increased size scales)
      if (width < 450) {
        font = "bold 44px Inter, sans-serif";
        lines = ["Adhithyakrishna", "R"];
        startY = height / 2 - 20;
        lineSpacing = 50;
      } else if (width < 640) {
        font = "bold 52px Inter, sans-serif";
        lines = [name];
        startY = height / 2 + 5;
      } else if (width < 1024) {
        font = "bold 72px Inter, sans-serif";
        lines = [name];
        startY = height / 2 + 10;
      }

      oCtx.font = font;
      oCtx.textAlign = "center";
      oCtx.textBaseline = "middle";

      // Draw the text lines
      lines.forEach((line, index) => {
        const lineY = startY + index * lineSpacing;
        if (width >= 1200) {
          oCtx.textAlign = "left";
          oCtx.fillText(line, 2, lineY);
        } else {
          oCtx.textAlign = "center";
          oCtx.fillText(line, width / 2, lineY);
        }
      });

      // Extract pixel layout array
      const imgData = oCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Dynamic Grid Spacing to accommodate 3000 particles perfectly
      let gridSpacing = 2.1;
      let particleSize = 1.0;

      if (width < 450) {
        gridSpacing = 1.1; // tight spacing for mobile line wrapping
        particleSize = 0.65;
      } else if (width < 640) {
        gridSpacing = 1.35;
        particleSize = 0.75;
      } else if (width < 1024) {
        gridSpacing = 1.7;
        particleSize = 0.85;
      } else {
        gridSpacing = 2.1; // Desktop spacing
        particleSize = 1.0;
      }

      const uniqueCoordsMap = new Map<string, { x: number; y: number }>();

      // Safe alpha color reader
      const getAlphaAt = (px: number, py: number) => {
        const rx = Math.round(px);
        const ry = Math.round(py);
        if (rx < 0 || rx >= width || ry < 0 || ry >= height) return 0;
        const idx = (ry * width + rx) * 4;
        return data[idx + 3];
      };

      // Scan and strictly align inside solid text body limits
      for (let y = 0; y < height; y += 1.0) {
        for (let x = 0; x < width; x += 1.0) {
          const index = (Math.round(y) * width + Math.round(x)) * 4;
          const alpha = data[index + 3];

          if (alpha > 128) {
            // Snap coordinate strictly to the straight grid matrix
            const gridX = Math.round(x / gridSpacing) * gridSpacing;
            const gridY = Math.round(y / gridSpacing) * gridSpacing;

            // Strict double boundary verification:
            // Ensure the snapped grid coordinate itself has a high opacity (alpha > 220)
            if (getAlphaAt(gridX, gridY) > 220) {
              const key = `${gridX.toFixed(1)},${gridY.toFixed(1)}`;
              if (!uniqueCoordsMap.has(key)) {
                uniqueCoordsMap.set(key, { x: gridX, y: gridY });
              }
            }
          }
        }
      }

      // Convert unique solid grid points to an array
      const activeCoords = Array.from(uniqueCoordsMap.values());

      // Target exactly 3000 particles
      const targetCount = 6000;
      const count = Math.min(targetCount, activeCoords.length);

      for (let i = 0; i < count; i++) {
        // Uniform interval coordinate sampling to map coordinates evenly
        const coordIndex = Math.floor((i * activeCoords.length) / count);
        const { x, y } = activeCoords[coordIndex];

        // Instantiate particle strictly snapped to the straight matrix grid
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          size: particleSize,
          density: 22,
          color: "rgba(255, 255, 255, 0.95)",
        });
      }
    };

    initParticles();

    // Mouse interactive hooks
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Responsive resize handler with debouncer
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initParticles();
      }, 200);
    };
    window.addEventListener("resize", handleResize);

    // Physics Animation Loop with calibrated spring alignment
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const r = mouseRef.current.radius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Repel physics
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < r) {
          const force = (r - dist) / r;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * p.density * 0.85;
          const pushY = Math.sin(angle) * force * p.density * 0.85;
          p.vx -= pushX;
          p.vy -= pushY;
        }

        // 2. High-precision alignment spring restoration (ease = 0.14)
        const homeDx = p.baseX - p.x;
        const homeDy = p.baseY - p.y;
        p.vx += homeDx * 0.14; // Snappier spring rate
        p.vy += homeDy * 0.14;

        // 3. Calibrated tight friction updates (damping = 0.84)
        p.vx *= 0.84;
        p.vy *= 0.84;

        p.x += p.vx;
        p.y += p.vy;

        // 4. Render formal dot
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [name]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full cursor-default select-none pointer-events-auto"
    />
  );
};

export default ParticleText;
