import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Floating item descriptor
 */
export interface FloatingItem {
  id: string;
  label: string;
  category: 'cloud' | 'network' | 'system' | 'devops' | 'code' | 'orb';
  accentColor: string;
  isOrb?: boolean;
}

/**
 * Physics Body State
 */
interface PhysicsBody {
  id: string;
  label: string;
  category: string;
  accentColor: string;
  isOrb: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number; // Collision bounding radius
  mass: number;
  isHovered: boolean;
  isDragged: boolean;
  basePhase: number;
  pulsePhase: number;
}

/**
 * Props for ACanvas component
 */
export interface ACanvasProps {
  /** Responsive container class names (e.g. w-full h-[350px] sm:h-[500px] md:h-[650px] lg:h-[800px]) */
  className?: string;
  /** Optional interactive badge or hint display */
  showHint?: boolean;
  /** Optional override for mobile items count */
  mobileCount?: number;
  /** Optional override for desktop items count */
  desktopCount?: number;
}

export type AntiGravityCanvasProps = ACanvasProps;

// Full items catalog for Desktop (>= 768px): 21 items
const DESKTOP_ITEMS: FloatingItem[] = [
  { id: 'aws', label: 'AWS Cloud', category: 'cloud', accentColor: '#D4AF37' },
  { id: 'linux', label: 'Linux CLI', category: 'system', accentColor: '#E8DFD8' },
  { id: 'docker', label: 'Docker', category: 'devops', accentColor: '#38BDF8' },
  { id: 'python', label: 'Python 3', category: 'code', accentColor: '#F59E0B' },
  { id: 'k8s', label: 'Kubernetes', category: 'cloud', accentColor: '#60A5FA' },
  { id: 'cisco', label: 'Cisco CCNA', category: 'network', accentColor: '#2DD4BF' },
  { id: 'fastapi', label: 'FastAPI', category: 'code', accentColor: '#34D399' },
  { id: 'tcpip', label: 'TCP/IP', category: 'network', accentColor: '#FBBF24' },
  { id: 'devops', label: 'DevOps CI/CD', category: 'devops', accentColor: '#C084FC' },
  { id: 'vlan', label: 'VLAN Routing', category: 'network', accentColor: '#FB923C' },
  { id: 'git', label: 'Git & GitHub', category: 'devops', accentColor: '#F87171' },
  { id: 'postgres', label: 'PostgreSQL', category: 'system', accentColor: '#818CF8' },
  { id: 'bash', label: 'Bash Shell', category: 'system', accentColor: '#CBD5E1' },
  { id: 'subnet', label: 'CIDR Subnets', category: 'network', accentColor: '#FCD34D' },
  { id: 'terraform', label: 'Terraform', category: 'cloud', accentColor: '#A78BFA' },
  { id: 'security', label: 'Network Security', category: 'network', accentColor: '#FB7185' },
  // Ambient zero-gravity energy orbs
  { id: 'orb-1', label: '', category: 'orb', accentColor: '#D4AF37', isOrb: true },
  { id: 'orb-2', label: '', category: 'orb', accentColor: '#F7E7C4', isOrb: true },
  { id: 'orb-3', label: '', category: 'orb', accentColor: '#8C6D4F', isOrb: true },
  { id: 'orb-4', label: '', category: 'orb', accentColor: '#D4AF37', isOrb: true },
  { id: 'orb-5', label: '', category: 'orb', accentColor: '#E8DFD8', isOrb: true },
];

// Curated items for Mobile (< 768px): 12 items (strictly within 10–15 items)
const MOBILE_ITEMS: FloatingItem[] = [
  { id: 'aws', label: 'AWS', category: 'cloud', accentColor: '#D4AF37' },
  { id: 'linux', label: 'Linux', category: 'system', accentColor: '#E8DFD8' },
  { id: 'docker', label: 'Docker', category: 'devops', accentColor: '#38BDF8' },
  { id: 'python', label: 'Python', category: 'code', accentColor: '#F59E0B' },
  { id: 'cisco', label: 'CCNA', category: 'network', accentColor: '#2DD4BF' },
  { id: 'fastapi', label: 'FastAPI', category: 'code', accentColor: '#34D399' },
  { id: 'tcpip', label: 'TCP/IP', category: 'network', accentColor: '#FBBF24' },
  { id: 'devops', label: 'DevOps', category: 'devops', accentColor: '#C084FC' },
  { id: 'git', label: 'Git', category: 'devops', accentColor: '#F87171' },
  { id: 'bash', label: 'Bash', category: 'system', accentColor: '#CBD5E1' },
  { id: 'orb-1', label: '', category: 'orb', accentColor: '#D4AF37', isOrb: true },
  { id: 'orb-2', label: '', category: 'orb', accentColor: '#F7E7C4', isOrb: true },
];

/**
 * ACanvas (AntiGravityCanvas) Component
 * 
 * Provides an anti-gravity physics canvas with:
 * - Fluid container scaling and resize/orientation-change preservation
 * - Mobile optimizations (reduced particle count, scaled radius, reduced velocity)
 * - Full desktop physics density
 * - Touch & Mouse drag/fling physics with momentum
 * - touch-action: none to prevent page scrolling/pull-to-refresh while interacting
 */
export const ACanvas: React.FC<ACanvasProps> = ({
  className = 'w-full h-[350px] sm:h-[500px] md:h-[650px] lg:h-[800px]',
  showHint = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation state refs
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const prevSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const animFrameRef = useRef<number | null>(null);
  const isMobileRef = useRef<boolean>(false);

  // Dragging and interaction tracking
  const draggedBodyRef = useRef<PhysicsBody | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const pointerPosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  // Mobile hint visibility
  const [hasInteracted, setHasInteracted] = useState(false);

  /**
   * Helper: Calculate dimensions and collision radius for a body based on viewport breakpoint
   */
  const calculateBodyDimensions = useCallback((item: FloatingItem, isMobile: boolean) => {
    if (item.isOrb) {
      const radius = isMobile ? 8 : 14;
      return {
        width: radius * 2,
        height: radius * 2,
        radius,
        mass: radius * 0.8,
      };
    }

    // Badge pill dimensions
    if (isMobile) {
      // Scaled down by ~35% for mobile devices
      const charWidth = 6.2;
      const padding = 20;
      const width = Math.max(54, item.label.length * charWidth + padding);
      const height = 26;
      const radius = Math.hypot(width / 2, height / 2) * 0.82;
      return { width, height, radius, mass: 1.2 };
    } else {
      // Full density desktop dimensions
      const charWidth = 8.2;
      const padding = 28;
      const width = Math.max(76, item.label.length * charWidth + padding);
      const height = 36;
      const radius = Math.hypot(width / 2, height / 2) * 0.82;
      return { width, height, radius, mass: 2.0 };
    }
  }, []);

  /**
   * Initialize or update bodies
   */
  const createBody = useCallback((
    item: FloatingItem,
    width: number,
    height: number,
    isMobile: boolean,
    existingBody?: PhysicsBody
  ): PhysicsBody => {
    const dims = calculateBodyDimensions(item, isMobile);
    const padding = dims.radius + 10;
    const safeW = Math.max(10, width - padding * 2);
    const safeH = Math.max(10, height - padding * 2);

    const x = existingBody
      ? Math.max(dims.radius, Math.min(width - dims.radius, existingBody.x))
      : padding + Math.random() * safeW;

    const y = existingBody
      ? Math.max(dims.radius, Math.min(height - dims.radius, existingBody.y))
      : padding + Math.random() * safeH;

    // Mobile: reduce initial velocity and force multipliers
    const initialVelMultiplier = isMobile ? 0.35 : 0.8;
    const vx = existingBody
      ? existingBody.vx * 0.9
      : (Math.random() - 0.5) * initialVelMultiplier;
    const vy = existingBody
      ? existingBody.vy * 0.9
      : (Math.random() - 0.5) * initialVelMultiplier;

    return {
      id: item.id,
      label: item.label,
      category: item.category,
      accentColor: item.accentColor,
      isOrb: !!item.isOrb,
      x,
      y,
      vx,
      vy,
      width: dims.width,
      height: dims.height,
      radius: dims.radius,
      mass: dims.mass,
      isHovered: false,
      isDragged: false,
      basePhase: Math.random() * Math.PI * 2,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }, [calculateBodyDimensions]);

  /**
   * Handle responsive resize or orientation change
   */
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    if (newWidth <= 0 || newHeight <= 0) return;

    const isMobile = newWidth < 768;
    isMobileRef.current = isMobile;

    // DPR Scaling for razor-sharp rendering on Retina/mobile displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(newWidth * dpr);
    canvas.height = Math.floor(newHeight * dpr);

    const prevW = prevSizeRef.current.width;
    const prevH = prevSizeRef.current.height;

    const activeCatalog = isMobile ? MOBILE_ITEMS : DESKTOP_ITEMS;
    const existingBodiesMap = new Map(bodiesRef.current.map((b) => [b.id, b]));

    if (prevW > 0 && prevH > 0) {
      // Scale coordinates proportionally to prevent stretching or elements jumping outside boundaries
      const scaleX = newWidth / prevW;
      const scaleY = newHeight / prevH;

      bodiesRef.current = activeCatalog.map((item) => {
        const existing = existingBodiesMap.get(item.id);
        if (existing) {
          existing.x = existing.x * scaleX;
          existing.y = existing.y * scaleY;
          const dims = calculateBodyDimensions(item, isMobile);
          existing.width = dims.width;
          existing.height = dims.height;
          existing.radius = dims.radius;
          existing.mass = dims.mass;
          // Clamp inside viewport
          existing.x = Math.max(dims.radius, Math.min(newWidth - dims.radius, existing.x));
          existing.y = Math.max(dims.radius, Math.min(newHeight - dims.radius, existing.y));
          return existing;
        } else {
          return createBody(item, newWidth, newHeight, isMobile);
        }
      });
    } else {
      // Initial bodies distribution
      bodiesRef.current = activeCatalog.map((item) =>
        createBody(item, newWidth, newHeight, isMobile)
      );
    }

    prevSizeRef.current = { width: newWidth, height: newHeight };
  }, [calculateBodyDimensions, createBody]);

  /**
   * Pointer/Touch coordinate extractor
   */
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  /**
   * Hit test body at coordinates (px, py)
   */
  const findBodyAt = useCallback((px: number, py: number): PhysicsBody | null => {
    const bodies = bodiesRef.current;
    // Iterate in reverse so topmost rendered body is grabbed first
    for (let i = bodies.length - 1; i >= 0; i--) {
      const b = bodies[i];
      if (b.isOrb) {
        const dist = Math.hypot(px - b.x, py - b.y);
        if (dist <= b.radius * 1.5) return b;
      } else {
        // Pill rectangle hit test with generous touch padding for mobile
        const pad = isMobileRef.current ? 8 : 4;
        const halfW = b.width / 2 + pad;
        const halfH = b.height / 2 + pad;
        if (
          px >= b.x - halfW &&
          px <= b.x + halfW &&
          py >= b.y - halfH &&
          py <= b.y + halfH
        ) {
          return b;
        }
      }
    }
    return null;
  }, []);

  /**
   * Unified Pointer / Touch Start
   */
  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    pointerPosRef.current = { x, y, active: true };
    pointerHistoryRef.current = [{ x, y, time: performance.now() }];
    setHasInteracted(true);

    const hit = findBodyAt(x, y);
    if (hit) {
      draggedBodyRef.current = hit;
      hit.isDragged = true;
      hit.vx = 0;
      hit.vy = 0;
      dragOffsetRef.current = {
        x: hit.x - x,
        y: hit.y - y,
      };
    }
  }, [findBodyAt, getCanvasCoords]);

  /**
   * Unified Pointer / Touch Move
   */
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    pointerPosRef.current = { x, y, active: true };

    const now = performance.now();
    pointerHistoryRef.current.push({ x, y, time: now });
    // Keep only last 5 positions for smooth momentum calculation
    if (pointerHistoryRef.current.length > 5) {
      pointerHistoryRef.current.shift();
    }

    const dragged = draggedBodyRef.current;
    const canvas = canvasRef.current;
    if (dragged && canvas) {
      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);

      dragged.x = Math.max(dragged.radius, Math.min(w - dragged.radius, x + dragOffsetRef.current.x));
      dragged.y = Math.max(dragged.radius, Math.min(h - dragged.radius, y + dragOffsetRef.current.y));
    } else {
      // Update hover state
      bodiesRef.current.forEach((b) => {
        b.isHovered = Math.hypot(x - b.x, y - b.y) <= b.radius * 1.2;
      });
    }
  }, [getCanvasCoords]);

  /**
   * Unified Pointer / Touch End (momentum release)
   */
  const handlePointerUp = useCallback(() => {
    pointerPosRef.current.active = false;
    const dragged = draggedBodyRef.current;

    if (dragged) {
      // Calculate throw momentum from recent history
      const history = pointerHistoryRef.current;
      if (history.length >= 2) {
        const oldest = history[0];
        const newest = history[history.length - 1];
        const dt = Math.max(16, newest.time - oldest.time);
        const vx = ((newest.x - oldest.x) / dt) * 16;
        const vy = ((newest.y - oldest.y) / dt) * 16;

        // Force multiplier adjustments per breakpoint:
        // Mobile: reduced force multiplier to stay cleanly inside boundaries
        const forceMultiplier = isMobileRef.current ? 0.6 : 1.0;
        const maxSpeed = isMobileRef.current ? 5.5 : 9.0;

        dragged.vx = Math.max(-maxSpeed, Math.min(maxSpeed, vx * forceMultiplier));
        dragged.vy = Math.max(-maxSpeed, Math.min(maxSpeed, vy * forceMultiplier));
      }
      dragged.isDragged = false;
      draggedBodyRef.current = null;
    }

    pointerHistoryRef.current = [];
  }, []);

  /**
   * Physics Simulation & Rendering Loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let simulationTime = 0;

    const render = () => {
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      simulationTime += 0.016;
      const isMobile = isMobileRef.current;

      // 1. Breakpoint Physics Adjustments
      // Mobile: Reduced gravity velocity and force multipliers so objects stay cleanly within viewport boundaries
      const gravityVelocity = isMobile ? 0.018 : 0.042;
      const damping = isMobile ? 0.986 : 0.982;
      const maxSpeed = isMobile ? 4.8 : 8.5;
      const restitution = isMobile ? 0.65 : 0.75; // Soft bounce restitution

      const bodies = bodiesRef.current;
      const numBodies = bodies.length;

      // 2. Physics Update Step
      for (let i = 0; i < numBodies; i++) {
        const b = bodies[i];

        if (!b.isDragged) {
          // Anti-Gravity Floating force: gentle sinusoidal buoyancy wave
          const wavePhase = simulationTime * 1.1 + b.basePhase;
          const floatForceY = Math.sin(wavePhase) * gravityVelocity - gravityVelocity * 0.35;
          const floatForceX = Math.cos(wavePhase * 0.8) * (gravityVelocity * 0.5);

          b.vy += floatForceY;
          b.vx += floatForceX;

          // Gentle pointer repulsion on proximity when hovering
          if (pointerPosRef.current.active) {
            const dx = b.x - pointerPosRef.current.x;
            const dy = b.y - pointerPosRef.current.y;
            const dist = Math.hypot(dx, dy);
            const repelRadius = isMobile ? 65 : 100;
            if (dist < repelRadius && dist > 1) {
              const repelStrength = (1 - dist / repelRadius) * (isMobile ? 0.35 : 0.7);
              b.vx += (dx / dist) * repelStrength;
              b.vy += (dy / dist) * repelStrength;
            }
          }

          // Apply velocity damping (air resistance)
          b.vx *= damping;
          b.vy *= damping;

          // Clamp max speed
          const speed = Math.hypot(b.vx, b.vy);
          if (speed > maxSpeed) {
            b.vx = (b.vx / speed) * maxSpeed;
            b.vy = (b.vy / speed) * maxSpeed;
          }

          // Advance position
          b.x += b.vx;
          b.y += b.vy;

          // Boundary Collisions with elastic bounce
          if (b.x - b.radius < 0) {
            b.x = b.radius;
            b.vx = Math.abs(b.vx) * restitution;
          } else if (b.x + b.radius > width) {
            b.x = width - b.radius;
            b.vx = -Math.abs(b.vx) * restitution;
          }

          if (b.y - b.radius < 0) {
            b.y = b.radius;
            b.vy = Math.abs(b.vy) * restitution;
          } else if (b.y + b.radius > height) {
            b.y = height - b.radius;
            b.vy = -Math.abs(b.vy) * restitution;
          }
        }
      }

      // 3. Body-to-Body Elastic Collision Resolution
      for (let i = 0; i < numBodies; i++) {
        for (let j = i + 1; j < numBodies; j++) {
          const b1 = bodies[i];
          const b2 = bodies[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0.001) {
            // Overlap separation
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            if (!b1.isDragged) {
              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
            }
            if (!b2.isDragged) {
              b2.x += nx * overlap;
              b2.y += ny * overlap;
            }

            // Elastic impulse response
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const impulse = (2 * (nx * kx + ny * ky)) / (b1.mass + b2.mass);

            if (!b1.isDragged) {
              b1.vx -= impulse * b2.mass * nx * restitution;
              b1.vy -= impulse * b2.mass * ny * restitution;
            }
            if (!b2.isDragged) {
              b2.vx += impulse * b1.mass * nx * restitution;
              b2.vy += impulse * b1.mass * ny * restitution;
            }
          }
        }
      }

      // 4. Rendering Step
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Render all floating elements
      for (let i = 0; i < numBodies; i++) {
        const b = bodies[i];

        if (b.isOrb) {
          // --- Ambient Glowing Particle Orb ---
          const pulse = Math.sin(simulationTime * 2 + b.pulsePhase) * 0.2 + 0.8;
          const currentRadius = b.radius * pulse;

          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, currentRadius * 2);
          grad.addColorStop(0, b.accentColor);
          grad.addColorStop(0.4, `${b.accentColor}55`);
          grad.addColorStop(1, 'transparent');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius * 2, 0, Math.PI * 2);
          ctx.fill();

          // Core point
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // --- Interactive Tech Pill / Badge ---
          const halfW = b.width / 2;
          const halfH = b.height / 2;
          const cornerR = halfH; // Pill shaped ends

          ctx.save();
          ctx.translate(b.x, b.y);

          // Subtle tilt based on horizontal velocity
          const tilt = Math.max(-0.25, Math.min(0.25, b.vx * 0.04));
          ctx.rotate(tilt);

          // Dragged / Hovered aura
          if (b.isDragged || b.isHovered) {
            ctx.shadowColor = b.accentColor;
            ctx.shadowBlur = b.isDragged ? (isMobile ? 14 : 22) : 10;
          } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 6;
          }

          // 1. Badge Background Pill
          ctx.beginPath();
          ctx.roundRect(-halfW, -halfH, b.width, b.height, cornerR);
          ctx.fillStyle = b.isDragged
            ? 'rgba(26, 21, 17, 0.95)'
            : 'rgba(16, 13, 10, 0.84)';
          ctx.fill();

          // 2. Border Stroke
          ctx.lineWidth = b.isDragged ? 1.8 : b.isHovered ? 1.4 : 1.0;
          ctx.strokeStyle = b.isDragged
            ? '#D4AF37'
            : b.isHovered
            ? b.accentColor
            : 'rgba(212, 175, 55, 0.38)';
          ctx.stroke();

          // 3. Category Accent Dot Indicator
          const dotRadius = isMobile ? 2.5 : 3.5;
          const dotX = -halfW + (isMobile ? 11 : 14);
          ctx.beginPath();
          ctx.arc(dotX, 0, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = b.accentColor;
          ctx.fill();

          // 4. Tech Label Typography
          const fontSize = isMobile ? 10 : 12;
          ctx.font = `500 ${fontSize}px 'Montserrat', sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = b.isDragged ? '#FFFFFF' : '#E8DFD8';
          const textX = dotX + (isMobile ? 7 : 10);
          ctx.fillText(b.label, textX, 0.5);

          ctx.restore();
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  /**
   * Resize & Orientation Change Listeners
   */
  useEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [handleResize]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none touch-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Physics Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      />

      {/* Interactive Micro Hint (fades out once user interacts) */}
      {showHint && !hasInteracted && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-700 opacity-75 hover:opacity-100 z-10">
          <div className="px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-black/60 backdrop-blur-sm text-[9.5px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-[#EAD8C7] flex items-center space-x-2 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>Drag or Tap Tech Elements</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const AntiGravityCanvas = ACanvas;

export default ACanvas;
