#!/usr/bin/env python3
import os
import numpy as np
import logging
import json
import cv2

logger = logging.getLogger(__name__)

class WasteClassifier:
    def __init__(self):
        self.model = None
        self.class_indices = None
        self.class_names = None
        
    def load_model(self):
        if self.model is None:
            try:
                import tensorflow as tf
                model_path = 'waste_classifier_model.h5'
                class_indices_path = 'class_indices.json'
                
                if os.path.exists(model_path) and os.path.exists(class_indices_path):
                    self.model = tf.keras.models.load_model(model_path)
                    with open(class_indices_path, 'r') as f:
                        self.class_indices = json.load(f)
                    self.class_names = {v: k for k, v in self.class_indices.items()}
                    logger.info(f"Custom model loaded with classes: {list(self.class_indices.keys())}")
                else:
                    logger.warning("Trained model not found. Please run train_model.py first")
                    return False
                return True
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                return False
        return True
    
    def analyze_material(self, image_path):
        """Analyze material properties to distinguish plastic from metal"""
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Metal characteristics: high reflectivity, sharp highlights
        _, highlights = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        highlight_ratio = np.sum(highlights > 0) / highlights.size
        
        # Calculate standard deviation (metals have higher contrast)
        std_dev = np.std(gray)
        
        # Edge sharpness (metals have sharper edges)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Saturation (plastics often more saturated)
        saturation = hsv[:, :, 1].mean()
        
        return {
            'highlight_ratio': highlight_ratio,
            'std_dev': std_dev,
            'edge_density': edge_density,
            'saturation': saturation
        }
    
    def predict(self, image_path):
        try:
            if not self.load_model():
                return {'class': 'trash', 'confidence': 0.3}
            
            import tensorflow as tf
            from tensorflow.keras.preprocessing import image
            
            img = image.load_img(image_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = x / 255.0
            x = np.expand_dims(x, axis=0)
            
            preds = self.model.predict(x, verbose=0)[0]
            top_idx = np.argmax(preds)
            confidence = float(preds[top_idx])
            predicted_class = self.class_names[top_idx]
            
            # Material analysis for plastic vs metal disambiguation
            material_props = self.analyze_material(image_path)
            if material_props:
                # If predicted plastic but has metal properties
                if predicted_class == 'plastic' and material_props['highlight_ratio'] > 0.15 and material_props['std_dev'] > 40:
                    predicted_class = 'metal'
                    confidence = min(0.85, confidence)
                # If predicted metal but has plastic properties
                elif predicted_class == 'metal' and material_props['saturation'] > 50 and material_props['highlight_ratio'] < 0.08:
                    predicted_class = 'plastic'
                    confidence = min(0.85, confidence)
            
            return {'class': predicted_class, 'confidence': confidence}
                
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return {'class': 'trash', 'confidence': 0.3}

_classifier = WasteClassifier()

def predict_image(image_path):
    return _classifier.predict(image_path)