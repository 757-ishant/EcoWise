# EcoWise - AI Waste Classification System

Smart waste classification with advanced battery detection and recycling guidance.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up database:**
   ```bash
   python init_db.py
   ```

3. **Download dataset (optional for training):**
   ```bash
   python download_dataset.py
   ```

4. **Start the application:**
   ```bash
   python run_app.py
   ```

5. **Open browser:** `http://localhost:5000`

## 🎯 Features

- **Smart Classification**: Advanced computer vision for accurate waste identification
- **Battery Detection**: Specialized detection for multiple batteries (your main requirement)
- **12 Waste Categories**: Battery, plastic, metal, glass, paper, cardboard, clothes, shoes, biological, trash
- **Recycling Guide**: Detailed instructions for proper disposal
- **Web Interface**: Modern, responsive design
- **Real-time Results**: Instant classification with confidence scores

## 🔋 Battery Detection

The system uses multiple methods to detect batteries:
- **Filename analysis**: Detects "battery", "batt", "cell" keywords
- **Shape detection**: Identifies circular/cylindrical objects
- **Color analysis**: Recognizes battery colors (black, silver, gold)
- **Multiple object detection**: Handles images with many batteries

## 📁 Project Structure

```
AI ML Project/
├── frontend/           # Web interface
├── backend/           # AI models
├── uploads/           # User images
├── datasets/          # Training data
├── model_new.py       # Main classification model
├── run_app.py         # Flask application
└── requirements.txt   # Dependencies
```

## 🛠️ Training (Optional)

To train your own model:
```bash
python train_model.py
```

## 🧪 Testing

Test the model:
```bash
python test_new_model.py
```

## 🧹 Cleanup

Remove unnecessary files:
```bash
python cleanup.py
```

---

**EcoWise** - Making waste management smarter with AI 🌱