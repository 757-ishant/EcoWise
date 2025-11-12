const uploadForm = document.getElementById('upload-form');
const imageInput = document.getElementById('image-input');
const dropzone = document.getElementById('dropzone');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');
const classifyBtn = document.getElementById('classify-btn');
const resultsContainer = document.getElementById('results-container');
const loadingState = document.getElementById('loading-state');

let selectedFile = null;

dropzone.addEventListener('click', () => imageInput.click());

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary)';
});

dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '';
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        displayPreview(file);
    }
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        displayPreview(file);
    }
});

function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        dropzone.style.display = 'none';
        imagePreview.style.display = 'block';
        classifyBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

removeImageBtn.addEventListener('click', () => {
    selectedFile = null;
    imageInput.value = '';
    previewImg.src = '';
    dropzone.style.display = 'block';
    imagePreview.style.display = 'none';
    classifyBtn.disabled = true;
    showEmptyState();
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    showLoading();

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
        const response = await fetch('/api/classify', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Classification failed');
        }

        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
});

function showLoading() {
    resultsContainer.style.display = 'none';
    loadingState.style.display = 'block';
    classifyBtn.disabled = true;
}

function hideLoading() {
    loadingState.style.display = 'none';
    resultsContainer.style.display = 'block';
    classifyBtn.disabled = false;
}

function showEmptyState() {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-image"></i>
            <h3>No Image Selected</h3>
            <p>Upload an image to see classification results</p>
        </div>
    `;
}

function displayResults(data) {
    const objects = data.objects || [{
        class: data.class,
        confidence: data.confidence || 0
    }];

    let html = '';
    objects.forEach((obj, i) => {
        const confidence = Math.round((obj.confidence || 0) * 100);
        const wasteClass = obj.class || 'unknown';
        
        html += `
            <div class="result-card">
                <h3>Object ${i + 1}: ${formatClass(wasteClass)}</h3>
                <div style="display: flex; align-items: center; gap: 2rem; margin: 1.5rem 0;">
                    <div style="position: relative; width: 120px; height: 120px;">
                        <svg width="120" height="120" style="transform: rotate(-90deg);">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" stroke-width="10" 
                                stroke-dasharray="${2 * Math.PI * 50}" 
                                stroke-dashoffset="${2 * Math.PI * 50 * (1 - confidence / 100)}" 
                                stroke-linecap="round"/>
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.5rem; font-weight: 700; color: var(--text-light);">
                            ${confidence}%
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <p style="color: var(--text-light); margin-bottom: 0.5rem;"><strong>Confidence:</strong> ${confidence}%</p>
                        <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">Classification accuracy</p>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px; margin-top: 1rem;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-recycle"></i> Recycling Guide
                    </h4>
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.6;">
                        ${getRecyclingGuide(wasteClass)}
                    </div>
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

function formatClass(cls) {
    return cls.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getRecyclingGuide(wasteClass) {
    const guides = {
        'battery': `
            <p><strong>⚠️ NEVER throw batteries in regular trash!</strong></p>
            <p><strong>Step-by-Step Disposal:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Identify battery type:</strong> AA, AAA, button cells, rechargeable, or car batteries</li>
                <li><strong>Store safely:</strong> Place in a plastic bag or tape terminals to prevent short circuits</li>
                <li><strong>Find collection point:</strong> Electronics stores, supermarkets, or recycling centers accept batteries</li>
                <li><strong>Drop off:</strong> Place in designated battery collection bins (usually near store entrance)</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Where to Take Them:</strong> Best Buy, Home Depot, Lowe's, Walmart, or local hazardous waste facilities</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Batteries contain toxic metals (mercury, lead, cadmium) that poison soil and water. One battery can contaminate 600,000 liters of water!</p>
        `,
        'biological': `
            <p><strong>Turn food waste into garden gold!</strong></p>
            <p><strong>Step-by-Step Composting:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Collect scraps:</strong> Fruit/vegetable peels, coffee grounds, tea bags, eggshells, yard waste</li>
                <li><strong>Choose method:</strong> Backyard compost bin, countertop composter, or municipal green bin</li>
                <li><strong>Avoid:</strong> Meat, dairy, oils, pet waste (these attract pests and smell bad)</li>
                <li><strong>Maintain:</strong> Mix occasionally, keep moist but not soggy</li>
                <li><strong>Use compost:</strong> After 2-6 months, use nutrient-rich soil for plants</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Quick Tip:</strong> Keep a small container on your kitchen counter for daily scraps, then transfer to main bin</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Food waste in landfills creates methane (28x worse than CO2). Composting reduces waste by 30% and creates free fertilizer!</p>
        `,
        'brown-glass': `
            <p><strong>Glass can be recycled forever without losing quality!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Empty completely:</strong> Pour out all liquids</li>
                <li><strong>Remove caps/lids:</strong> Metal and plastic caps go in separate recycling</li>
                <li><strong>Quick rinse:</strong> Rinse with water to remove residue (doesn't need to be spotless)</li>
                <li><strong>Leave labels on:</strong> They burn off during recycling process</li>
                <li><strong>Place in bin:</strong> Put in glass recycling bin or mixed recycling (check local rules)</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Don't Recycle:</strong> Mirrors, light bulbs, drinking glasses, ceramics, or window glass (different melting points)</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Recycling glass saves 30% energy, reduces air pollution by 20%, and one ton of recycled glass saves 1.2 tons of raw materials!</p>
        `,
        'cardboard': `
            <p><strong>Cardboard is one of the easiest materials to recycle!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Remove contents:</strong> Take out all items, packing materials, and plastic</li>
                <li><strong>Remove tape/staples:</strong> Pull off packing tape and metal staples (small amounts OK)</li>
                <li><strong>Flatten boxes:</strong> Break down boxes to save space - step on them or cut along seams</li>
                <li><strong>Keep dry:</strong> Wet cardboard can't be recycled - store in dry place</li>
                <li><strong>Place in bin:</strong> Put in cardboard/paper recycling bin</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Special Cases:</strong> Pizza boxes with grease → compost. Wax-coated boxes → trash. Small amounts → regular paper bin</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Recycling 1 ton of cardboard saves 17 trees, 7,000 gallons of water, and enough energy to power a home for 6 months!</p>
        `,
        'clothes': `
            <p><strong>Give your clothes a second life!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Sort by condition:</strong> Wearable vs. damaged/worn out</li>
                <li><strong>Wearable clothes:</strong> Donate to Goodwill, Salvation Army, local shelters, or thrift stores</li>
                <li><strong>Damaged clothes:</strong> Use textile recycling bins (H&M, North Face accept any condition)</li>
                <li><strong>Get creative:</strong> Cut into cleaning rags, pet bedding, or craft projects</li>
                <li><strong>Wash first:</strong> Clean items before donating (shows respect for next owner)</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Store Programs:</strong> H&M, Zara, North Face, Patagonia offer recycling programs + discount coupons!</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Fashion industry creates 10% of global carbon emissions. Extending clothes life by 9 months reduces environmental impact by 30%!</p>
        `,
        'green-glass': `
            <p><strong>Glass can be recycled forever without losing quality!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Empty completely:</strong> Pour out all liquids</li>
                <li><strong>Remove caps/lids:</strong> Metal and plastic caps go in separate recycling</li>
                <li><strong>Quick rinse:</strong> Rinse with water to remove residue (doesn't need to be spotless)</li>
                <li><strong>Leave labels on:</strong> They burn off during recycling process</li>
                <li><strong>Place in bin:</strong> Put in glass recycling bin or mixed recycling (check local rules)</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Don't Recycle:</strong> Mirrors, light bulbs, drinking glasses, ceramics, or window glass (different melting points)</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Recycling glass saves 30% energy, reduces air pollution by 20%, and one ton of recycled glass saves 1.2 tons of raw materials!</p>
        `,
        'metal': `
            <p><strong>Metal is super valuable - recycling centers love it!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Empty & rinse:</strong> Remove food residue with quick water rinse</li>
                <li><strong>Labels OK:</strong> No need to remove labels - they're burned off in recycling</li>
                <li><strong>Crush cans:</strong> Step on aluminum cans to save space (optional but helpful)</li>
                <li><strong>Check magnet test:</strong> Magnetic = steel, non-magnetic = aluminum (both recyclable!)</li>
                <li><strong>Place in bin:</strong> Put in metal recycling or mixed recycling bin</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Bonus:</strong> Aluminum foil, pie tins, and metal bottle caps are recyclable too! Just ball up small pieces together</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Recycling aluminum saves 95% energy vs. making new! One recycled can saves enough energy to run a TV for 3 hours</p>
        `,
        'paper': `
            <p><strong>Paper is one of the most recycled materials!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Remove non-paper:</strong> Take out plastic windows from envelopes, remove paper clips/staples</li>
                <li><strong>Keep it dry:</strong> Wet paper can't be recycled - it clogs machines</li>
                <li><strong>No food contamination:</strong> Greasy pizza boxes, used napkins → compost instead</li>
                <li><strong>Shredded paper:</strong> Put in clear/paper bag before recycling (loose shreds jam machines)</li>
                <li><strong>Place in bin:</strong> Put in paper recycling bin</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 What's Recyclable:</strong> Newspapers, magazines, office paper, mail, cardboard. NOT: Receipts (thermal coating), wax paper, tissue</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Recycling 1 ton of paper saves 17 trees, 7,000 gallons of water, and prevents 60 pounds of air pollution!</p>
        `,
        'plastic': `
            <p><strong>Check the number on the bottom - it matters!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Find the number:</strong> Look for triangle with number 1-7 on bottom</li>
                <li><strong>Most accepted:</strong> #1 (water bottles) and #2 (milk jugs) - almost always recyclable</li>
                <li><strong>Empty & rinse:</strong> Remove food/liquid, quick rinse with water</li>
                <li><strong>Remove caps:</strong> Caps are often different plastic - recycle separately if accepted</li>
                <li><strong>Place in bin:</strong> Put in plastic recycling bin</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Plastic Bags:</strong> Don't put in curbside bin! Return to grocery stores (they have special collection bins)</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Only 9% of plastic ever made has been recycled. Every piece you recycle helps reduce ocean pollution and saves marine life!</p>
        `,
        'shoes': `
            <p><strong>Don't throw away shoes - they can be reused or recycled!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Clean them up:</strong> Wipe off dirt and mud</li>
                <li><strong>Wearable shoes:</strong> Donate to Goodwill, Salvation Army, Soles4Souls, or local shelters</li>
                <li><strong>Worn-out athletic shoes:</strong> Nike Reuse-A-Shoe program grinds them into sports surfaces</li>
                <li><strong>Any condition:</strong> Drop at textile recycling bins or mail to recycling programs</li>
                <li><strong>Tie together:</strong> Lace pairs together so they don't get separated</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Programs:</strong> Nike stores, DSW, Zappos for Good accept old shoes. Some give discount coupons!</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> 300 million pairs of shoes end up in landfills yearly. Shoes take 30-40 years to decompose and release toxic chemicals!</p>
        `,
        'trash': `
            <p><strong>Before throwing away, ask: Can this be reused, repaired, or recycled?</strong></p>
            <p><strong>Step-by-Step (Last Resort):</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Double-check:</strong> Is there really no way to recycle this? Check Earth911.com for options</li>
                <li><strong>Reduce size:</strong> Break down or compress items to save landfill space</li>
                <li><strong>Bag properly:</strong> Use trash bags to contain waste and prevent litter</li>
                <li><strong>Place in bin:</strong> Put in general waste bin for landfill</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Better Options:</strong> Repair broken items, donate unwanted items, buy products with less packaging, choose reusable over disposable</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Average person creates 4.5 pounds of trash daily. Landfills release methane and contaminate groundwater. Reduce, reuse, then recycle!</p>
        `,
        'white-glass': `
            <p><strong>Glass can be recycled forever without losing quality!</strong></p>
            <p><strong>Step-by-Step Recycling:</strong></p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; line-height: 1.8;">
                <li><strong>Empty completely:</strong> Pour out all liquids</li>
                <li><strong>Remove caps/lids:</strong> Metal and plastic caps go in separate recycling</li>
                <li><strong>Quick rinse:</strong> Rinse with water to remove residue (doesn't need to be spotless)</li>
                <li><strong>Leave labels on:</strong> They burn off during recycling process</li>
                <li><strong>Place in bin:</strong> Put in glass recycling bin or mixed recycling (check local rules)</li>
            </ol>
            <p style="margin-top: 1rem;"><strong>💡 Don't Recycle:</strong> Mirrors, light bulbs, drinking glasses, ceramics, or window glass (different melting points)</p>
            <p style="margin-top: 0.5rem;"><strong>🌍 Why It Matters:</strong> Recycling glass saves 30% energy, reduces air pollution by 20%, and one ton of recycled glass saves 1.2 tons of raw materials!</p>
        `
    };
    return guides[wasteClass] || '<p>Check local recycling guidelines for proper disposal.</p>';
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-circle" style="color: var(--secondary);"></i>
            <h3 style="color: var(--secondary);">Error</h3>
            <p>${message}</p>
        </div>
    `;
}

showEmptyState();
