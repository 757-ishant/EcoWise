from ultralytics import YOLO
import os
import uuid
import numpy as np
import cv2


_model = None

def get_detector(model_name='yolov8n.pt'):
    global _model
    if _model is None:
        try:
            _model = YOLO(model_name)
        except Exception:
            _model = YOLO('yolov8n')
    return _model

def detect_and_crop(image_path, save_dir):
    """Run YOLO detection and save cropped objects to save_dir.

    Returns a list of dicts: {bbox: [x1,y1,x2,y2], crop_path: path}
    """
    os.makedirs(save_dir, exist_ok=True)
    model = get_detector()
    results = model(image_path, imgsz=640)
    detections = []
    img = cv2.imread(image_path)
    h, w = img.shape[:2]

    for r in results:
        boxes = r.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = int(max(0, x1)), int(max(0, y1)), int(min(w, x2)), int(min(h, y2))
            crop = img[y1:y2, x1:x2]
            crop_name = f"{uuid.uuid4().hex}_crop.jpg"
            crop_path = os.path.join(save_dir, crop_name)
            cv2.imwrite(crop_path, crop)
            detections.append({'bbox': [x1, y1, x2, y2], 'crop_path': crop_path})

    return detections
