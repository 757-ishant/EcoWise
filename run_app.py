import os
import logging
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime

from db import get_db_connection
from model_new import predict_image
import uuid
import cv2
import numpy as np
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'frontend')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Flask app configuration
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Load YOLO model
yolo_model = YOLO('yolov8n.pt')


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/api')
def api_status():
    # If templates/api_status.html exists, render it, otherwise return simple JSON
    try:
        return render_template('api_status.html')
    except Exception:
        return jsonify({'status': 'running', 'endpoints': ['/api/classify', '/api/recent']})


@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/api/classify', methods=['POST'])
def classify():
    logger.info('Received /api/classify request')
    if 'image' not in request.files:
        logger.warning('No image uploaded in request')
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    if image.filename == '':
        logger.warning('Empty filename')
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(image.filename):
        logger.warning(f'Invalid file type: {image.filename}')
        return jsonify({'error': 'Invalid file type'}), 400

    # Save file
    try:
        filename = secure_filename(image.filename)
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        image.save(filepath)
        logger.info(f'Saved upload to {filepath}')
    except Exception as e:
        logger.error(f'Failed to save uploaded image: {e}')
        return jsonify({'error': 'Failed to save uploaded image'}), 500

    # Predict - detect multiple objects with YOLO then classify each
    def detect_and_classify(image_path):
        results = []
        temp_files = []
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError('Failed to read image for detection')

        h, w = img.shape[:2]
        
        # YOLO detection
        yolo_results = yolo_model(image_path, verbose=False)[0]
        boxes = yolo_results.boxes
        
        if len(boxes) >= 2:
            # Multiple objects detected
            for idx, box in enumerate(boxes):
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                crop = img[y1:y2, x1:x2]
                crop_path = f"{os.path.splitext(image_path)[0]}_obj{idx}.jpg"
                cv2.imwrite(crop_path, crop)
                temp_files.append(crop_path)
                
                result = predict_image(crop_path)
                results.append({
                    'bbox': [x1, y1, x2, y2],
                    'class': result.get('class', 'unknown'),
                    'confidence': float(result.get('confidence', 0.0)),
                    'crop_url': f"/uploads/{os.path.basename(crop_path)}"
                })
        else:
            # Single or no object - classify whole image
            result = predict_image(image_path)
            results.append({
                'bbox': [0, 0, w, h],
                'class': result.get('class', 'unknown'),
                'confidence': float(result.get('confidence', 0.0)),
                'crop_url': f"/uploads/{os.path.basename(image_path)}"
            })

        return results, temp_files

    temp_files_to_delete = []
    try:
        multi_results, temp_files_to_delete = detect_and_classify(filepath)
    except Exception as e:
        import traceback
        logger.error(f'Prediction failed: {e}\n{traceback.format_exc()}')
        # Remove saved file if prediction fails
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass
        return jsonify({'error': 'Prediction failed'}), 500
    finally:
        # Clean up all temporary cropped files
        for temp_file in temp_files_to_delete:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file {temp_file}: {e}")

    # Save record to DB (best-effort) - store first object's prediction as summary
    try:
        summary_class = None
        summary_conf = None
        if isinstance(multi_results, list) and len(multi_results) > 0:
            summary_class = multi_results[0].get('class')
            summary_conf = float(multi_results[0].get('confidence', 0.0))

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO classifications (filename, predicted_class, confidence, upload_date)
            VALUES (%s, %s, %s, %s)
            """,
            (unique_filename, summary_class, summary_conf, datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        logger.warning(f'Database insert failed: {e}')

    # Calculate percentage breakdown
    class_counts = {}
    for obj in multi_results:
        cls = obj['class']
        class_counts[cls] = class_counts.get(cls, 0) + 1
    
    total = len(multi_results)
    percentages = {cls: round((count / total) * 100, 1) for cls, count in class_counts.items()}
    
    return jsonify({
        'objects': multi_results,
        'percentages': percentages,
        'image_url': f'/uploads/{unique_filename}'
    })


@app.route('/uploads/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/delete/<filename>', methods=['DELETE'])
def delete_image(filename):
    try:
        # Delete from uploads folder
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete from database
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM classifications WHERE filename = %s", (filename,))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            logger.warning(f'Database delete failed: {e}')
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Delete failed: {e}')
        return jsonify({'error': 'Delete failed'}), 500

@app.route('/api/recent', methods=['GET'])
def get_recent_classifications():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT filename, predicted_class, confidence, upload_date
            FROM classifications
            ORDER BY upload_date DESC
            LIMIT 50
            """
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        for r in rows:
            r['image_url'] = f"/uploads/{r['filename']}"
            if isinstance(r.get('upload_date'), datetime):
                r['upload_date'] = r['upload_date'].isoformat()
        return jsonify(rows)
    except Exception as e:
        logger.warning(f'Database query failed: {e}')
        # If the database is down, it's better to return an empty list or an error
        # than to return potentially incorrect data from the filesystem.
        return jsonify([])


if __name__ == '__main__':
    app.run(debug=True, port=5000)
