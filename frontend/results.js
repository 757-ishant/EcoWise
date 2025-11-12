async function loadResults() {
    try {
        const response = await fetch('/api/recent');
        const data = await response.json();
        
        const tbody = document.getElementById('results-tbody');
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.7);">
                        No results yet. Start classifying!
                    </td>
                </tr>
            `;
            return;
        }
        
        document.getElementById('total-count').textContent = data.length;
        const avgConf = data.reduce((sum, item) => sum + item.confidence, 0) / data.length;
        document.getElementById('avg-confidence').textContent = Math.round(avgConf * 100) + '%';
        
        const recyclable = ['plastic', 'metal', 'paper', 'cardboard', 'glass', 'green-glass', 'brown-glass', 'white-glass'];
        const recyclableCount = data.filter(item => recyclable.some(r => item.predicted_class.includes(r))).length;
        document.getElementById('recyclable').textContent = Math.round((recyclableCount / data.length) * 100) + '%';
        
        tbody.innerHTML = data.map(item => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <td style="padding: 1rem;"><img src="${item.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"></td>
                <td style="padding: 1rem; color: var(--text-light);">${formatClass(item.predicted_class)}</td>
                <td style="padding: 1rem; color: var(--text-light);">${Math.round(item.confidence * 100)}%</td>
                <td style="padding: 1rem; color: var(--text-light);">${new Date(item.upload_date).toLocaleDateString()}</td>
                <td style="padding: 1rem;">
                    <button onclick="deleteItem('${item.filename}')" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        createChart(data);
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

function createChart(data) {
    const categoryCounts = {};
    data.forEach(item => {
        const cls = item.predicted_class;
        categoryCounts[cls] = (categoryCounts[cls] || 0) + 1;
    });
    
    const ctx = document.getElementById('distribution-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryCounts).map(formatClass),
            datasets: [{
                label: 'Number of Items',
                data: Object.values(categoryCounts),
                backgroundColor: 'rgba(0, 255, 136, 0.6)',
                borderColor: 'rgba(0, 255, 136, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.9)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
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

loadResults();
