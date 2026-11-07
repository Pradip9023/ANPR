"""
Asynchronous OpenCV Camera Capture & RTSP Ingestion Worker
Supports frame skipping, reconnection retry loops, and thread-isolated processing
"""

import time
import threading
from typing import Optional, Callable, Dict, Any
import numpy as np

class CameraStreamWorker:
    def __init__(
        self,
        camera_id: str,
        rtsp_or_device: str,
        frame_skip: int = 2,
        on_frame_callback: Optional[Callable[[str, np.ndarray], None]] = None,
    ):
        self.camera_id = camera_id
        self.source = rtsp_or_device
        self.frame_skip = frame_skip
        self.on_frame_callback = on_frame_callback
        
        self.is_running = False
        self.thread: Optional[threading.Thread] = None
        self.latest_frame: Optional[np.ndarray] = None
        self.fps_actual: float = 0.0
        self.is_connected: bool = False

    def start(self):
        """Starts worker thread."""
        if self.is_running:
            return
        self.is_running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()

    def stop(self):
        """Gracefully stops camera worker."""
        self.is_running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2.0)

    def _capture_loop(self):
        """Continuous frame ingestion loop with auto-reconnect."""
        try:
            import cv2
        except ImportError:
            print(f"[Camera {self.camera_id}] OpenCV not installed. Running in mock simulation mode.")
            self._mock_stream_loop()
            return

        frame_count = 0
        reconnect_attempts = 0

        while self.is_running:
            # Check source format (int for USB webcam or string for RTSP)
            src = int(self.source) if self.source.isdigit() else self.source
            cap = cv2.VideoCapture(src)

            if not cap.isOpened():
                self.is_connected = False
                reconnect_attempts += 1
                wait_time = min(10, 2 ** reconnect_attempts)
                print(f"[Camera {self.camera_id}] Connection failed to {self.source}. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue

            self.is_connected = True
            reconnect_attempts = 0
            last_fps_calc = time.time()
            fps_counter = 0

            while self.is_running and cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    print(f"[Camera {self.camera_id}] Stream frame dropped or disconnected.")
                    break

                frame_count += 1
                fps_counter += 1

                # Frame skipping
                if frame_count % self.frame_skip != 0:
                    continue

                self.latest_frame = frame
                if self.on_frame_callback:
                    try:
                        self.on_frame_callback(self.camera_id, frame)
                    except Exception as err:
                        print(f"[Camera {self.camera_id}] Callback error: {err}")

                # Calculate actual FPS
                now = time.time()
                if now - last_fps_calc >= 1.0:
                    self.fps_actual = fps_counter / (now - last_fps_calc)
                    fps_counter = 0
                    last_fps_calc = now

            cap.release()
            self.is_connected = False

    def _mock_stream_loop(self):
        """Mock stream generator when OpenCV device is absent."""
        self.is_connected = True
        while self.is_running:
            dummy = np.zeros((720, 1280, 3), dtype=np.uint8)
            self.latest_frame = dummy
            if self.on_frame_callback:
                self.on_frame_callback(self.camera_id, dummy)
            time.sleep(0.033)
