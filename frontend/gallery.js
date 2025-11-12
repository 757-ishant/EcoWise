async function loadGallery() {
    try {
        const response = await fetch('/api/recent');
        const data = await response.json();
        
        const galleryGrid = document.getElementById('gallery-grid');
        
        if (data.length === 0) {
            return;
        }
        
        galleryGrid.innerHTML = data.map(item => `
            <div class="feature-card" style="position: relative;">
                <button onclick="deleteItem('${item.filename}')" style="position: absolute; top: 10px; right: 10px; background: rgba(255, 0, 0, 0.8); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; z-index: 10;">
                    <i class="fas fa-trash"></i>
                </button>
                <img src="${item.image_url}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem;">
                <h3>${formatClass(item.predicted_class)}</h3>
                <p>${Math.round(item.confidence * 100)}% confidence</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

async function deleteItem(filename) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`/api/delete/${filename}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
    }
}

function formatClass(cls) {
    return cls.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

loadGallery();
