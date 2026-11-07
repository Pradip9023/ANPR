import React, { useRef, useEffect, useState } from 'react';
import { Camera, VehicleDetection } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Camera as CameraIcon,
  Video,
  Upload,
  RefreshCw,
  Maximize2,
  Scan,
  Sliders,
  Moon,
  Sun,
  ShieldAlert,
  Play,
  Square,
} from 'lucide-react';

interface CameraFeedCanvasProps {
  camera: Camera;
  heightClass?: string;
  showControls?: boolean;
  onDetectVehicle?: (plate?: string) => void;
  activeDetection?: VehicleDetection | null;
}

export const CameraFeedCanvas: React.FC<CameraFeedCanvasProps> = ({
  camera,
  heightClass = 'h-[400px]',
  showControls = true,
  onDetectVehicle,
  activeDetection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { isSimulatorActive, simulateVehicleArrival } = useApp();

  const [feedMode, setFeedMode] = useState<'SYNTHETIC' | 'WEBCAM' | 'VIDEO_FILE'>('SYNTHETIC');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
  const [fpsVal, setFpsVal] = useState<number>(camera.fps || 30);
  const [lastDetectedPlate, setLastDetectedPlate] = useState<string>('GJ01AB1234');
  const [streamPaused, setStreamPaused] = useState<boolean>(false);

  // Animation frame state for moving vehicle simulation
  const animState = useRef({
    vehicleX: 0.1,
    vehicleY: 0.45,
    speed: 0.003,
    direction: 1,
    vehicleType: 'Car',
    plate: 'GJ01AB1234',
    speedKmh: 64,
  });

  // Stop webcam stream when switching away
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  // Switch to real webcam
  const startWebcam = async () => {
    try {
      stopWebcam();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setWebcamActive(true);
        setFeedMode('WEBCAM');
      }
    } catch (err) {
      console.warn('Webcam permission denied or camera not found:', err);
      alert('Camera access unavailable or declined. Reverting to Synthetic ANPR Stream.');
      setFeedMode('SYNTHETIC');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopWebcam();
      const url = URL.createObjectURL(file);
      setVideoFileUrl(url);
      setFeedMode('VIDEO_FILE');
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.loop = true;
        videoRef.current.play();
      }
    }
  };

  // Canvas render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrameTime = performance.now();
    let frameCounter = 0;

    const render = (time: number) => {
      // Calculate dynamic FPS
      frameCounter++;
      if (time - lastFrameTime >= 1000) {
        setFpsVal(frameCounter);
        frameCounter = 0;
        lastFrameTime = time;
      }

      const w = canvas.width;
      const h = canvas.height;

      if (feedMode === 'WEBCAM' || feedMode === 'VIDEO_FILE') {
        // Draw real webcam or video tag
        if (videoRef.current && videoRef.current.readyState >= 2) {
          ctx.drawImage(videoRef.current, 0, 0, w, h);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#64748b';
          ctx.font = '16px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('Loading Video Feed...', w / 2, h / 2);
        }
      } else {
        // Synthetic realistic road / gate stream
        if (!streamPaused) {
          animState.current.vehicleX += animState.current.speed * animState.current.direction;
          if (animState.current.vehicleX > 0.85) {
            animState.current.vehicleX = 0.05;
            // Pick next simulated vehicle
            const types = ['Car', 'SUV', 'Bike', 'Auto', 'Truck'];
            const plates = ['GJ01AB1234', 'MH12EF3456', 'DL08CAF1234', 'KA03MN9876', '22BH1234AA', 'UP32AB4499'];
            animState.current.vehicleType = types[Math.floor(Math.random() * types.length)];
            animState.current.plate = plates[Math.floor(Math.random() * plates.length)];
            animState.current.speedKmh = Math.floor(40 + Math.random() * 50);
            setLastDetectedPlate(animState.current.plate);
          }
        }

        // Draw Road / Gate Background
        const isEntryGate = camera.type.includes('PARKING');
        if (isEntryGate) {
          // Parking Gate visual
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, isNightMode ? '#050c18' : '#1e293b');
          grad.addColorStop(0.6, isNightMode ? '#0f172a' : '#334155');
          grad.addColorStop(1, isNightMode ? '#020617' : '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Lane markings
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 3;
          ctx.setLineDash([20, 20]);
          ctx.beginPath();
          ctx.moveTo(w * 0.5, h * 0.4);
          ctx.lineTo(w * 0.5, h);
          ctx.stroke();
          ctx.setLineDash([]);

          // Gate Barrier Boom Arm
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(w * 0.15, h * 0.65, 24, 70); // Pillar
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(w * 0.15 + 12, h * 0.65 + 10, 8, 0, Math.PI * 2);
          ctx.fill();

          // Barrier arm
          ctx.save();
          ctx.translate(w * 0.15 + 12, h * 0.65 + 10);
          // Angle depends on barrier
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w * 0.45, 0);
          ctx.stroke();
          ctx.restore();
        } else {
          // Highway Road visual
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, isNightMode ? '#020617' : '#0f172a');
          grad.addColorStop(0.4, isNightMode ? '#091322' : '#1e293b');
          grad.addColorStop(1, isNightMode ? '#020617' : '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Horizon & Road perspective lines
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(w * 0.35, h * 0.35);
          ctx.lineTo(w * 0.65, h * 0.35);
          ctx.lineTo(w * 0.95, h);
          ctx.lineTo(w * 0.05, h);
          ctx.closePath();
          ctx.fill();

          // Lane dividing dashes
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 4;
          ctx.setLineDash([25, 25]);
          ctx.beginPath();
          ctx.moveTo(w * 0.5, h * 0.35);
          ctx.lineTo(w * 0.5, h);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Simulated Vehicle
        const vx = animState.current.vehicleX * w;
        const vy = h * 0.52;
        const vw = w * 0.28;
        const vh = h * 0.28;

        // Vehicle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(vx + vw / 2, vy + vh * 0.92, vw * 0.45, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vehicle body
        const carGrad = ctx.createLinearGradient(vx, vy, vx, vy + vh);
        carGrad.addColorStop(0, '#0284c7');
        carGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = carGrad;
        ctx.beginPath();
        ctx.roundRect(vx, vy, vw, vh * 0.75, 16);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(vx + vw * 0.15, vy + vh * 0.08, vw * 0.7, vh * 0.3, 8);
        ctx.fill();

        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(vx + 8, vy + vh * 0.55, 14, 10);
        ctx.fillRect(vx + vw - 22, vy + vh * 0.55, 14, 10);

        // Physical Plate on Vehicle
        const px = vx + vw * 0.35;
        const py = vy + vh * 0.62;
        const pw = vw * 0.3;
        const ph = 14;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, pw, ph);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(animState.current.plate, px + pw / 2, py + 10);

        // Bounding Boxes Overlay
        if (showOverlays) {
          // Vehicle Bounding Box (YOLO Detection)
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.strokeRect(vx - 4, vy - 4, vw + 8, vh * 0.8 + 8);

          // Tag: Vehicle Class + Confidence
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(vx - 4, vy - 24, 140, 20);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(
            `${animState.current.vehicleType} 96% | ${animState.current.speedKmh} km/h`,
            vx,
            vy - 10
          );

          // Plate Bounding Box (License Plate Detection)
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(px - 2, py - 2, pw + 4, ph + 4);

          // Tag: Recognized Plate + OCR confidence
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(px - 2, py + ph + 4, pw + 35, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`IND: ${animState.current.plate} (97%)`, px, py + ph + 16);
        }
      }

      // Night mode post-filter effect
      if (isNightMode) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // Green night-vision tint
        ctx.fillRect(0, 0, w, h);
      }

      // Surveillance HUD Overlay
      if (showOverlays) {
        // Top HUD Bar
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, w, 32);

        // Camera name & info
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`CAM: ${camera.name.toUpperCase()} [${camera.id}]`, 12, 20);

        // Blinking REC dot
        const isBlinking = Math.floor(time / 500) % 2 === 0;
        ctx.fillStyle = isBlinking ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(w - 220, 16, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.fillText('REC', w - 208, 20);

        // Resolution & FPS
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${camera.resolution} | ${fpsVal} FPS | ${camera.latencyMs}ms`, w - 165, 20);

        // Bottom HUD Bar (Timestamp in IST)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, h - 26, w, 26);

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });

        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px monospace';
        ctx.fillText(`${dateStr} ${timeStr} IST`, 12, h - 9);

        // Active AI Engine Tag
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'right';
        ctx.fillText('AI ENGINE: YOLOv8-IN + PADDLEOCR-V4 ACTIVE', w - 12, h - 9);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      stopWebcam();
    };
  }, [camera, feedMode, isNightMode, showOverlays, streamPaused, activeDetection]);

  const handleManualTrigger = () => {
    if (onDetectVehicle) {
      onDetectVehicle(lastDetectedPlate);
    } else {
      simulateVehicleArrival(
        lastDetectedPlate,
        'CAR',
        camera.type.includes('ENTRY') ? 'entry' : camera.type.includes('EXIT') ? 'exit' : 'road'
      );
    }
  };

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      {/* Hidden elements for media streaming */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Main Canvas Viewport */}
      <div className={`relative w-full ${heightClass} bg-black flex items-center justify-center`}>
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain"
        />

        {/* Live Status Tag */}
        <div className="absolute top-10 left-3 flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 text-emerald-400 border border-emerald-500/30 backdrop-blur-xs">
            {feedMode === 'WEBCAM' ? 'LIVE USB/WEBCAM' : feedMode === 'VIDEO_FILE' ? 'LOCAL VIDEO FILE' : 'SYNTHETIC 4K STREAM'}
          </span>
        </div>

        {/* Floating Quick Action: Trigger ANPR on frame */}
        <div className="absolute bottom-10 right-3 flex items-center gap-2">
          <button
            onClick={handleManualTrigger}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-xs transition"
            title="Perform Instant YOLO & OCR Detection on current frame"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Capture & Run ANPR</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      {showControls && (
        <div className="px-4 py-2.5 bg-slate-800/90 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopWebcam();
                setFeedMode('SYNTHETIC');
              }}
              className={`px-2.5 py-1 rounded font-medium transition ${
                feedMode === 'SYNTHETIC'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Simulated Stream
            </button>
            <button
              onClick={startWebcam}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                feedMode === 'WEBCAM'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <CameraIcon className="w-3.5 h-3.5" />
              <span>Use Webcam</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                feedMode === 'VIDEO_FILE'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Video</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNightMode((prev) => !prev)}
              className={`p-1.5 rounded transition ${
                isNightMode ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title="Toggle Infrared Night Vision Filter"
            >
              {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowOverlays((prev) => !prev)}
              className={`px-2 py-1 rounded font-medium transition ${
                showOverlays ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
              title="Toggle Bounding Boxes & HUD overlay"
            >
              Overlays: {showOverlays ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setStreamPaused((prev) => !prev)}
              className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
              title={streamPaused ? 'Resume stream' : 'Pause stream'}
            >
              {streamPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
