document.addEventListener('DOMContentLoaded', function() {
    const guideSearch = document.getElementById('guide-search');
    const guideCategories = document.getElementById('guide-categories');

    const wasteGuides = {
        'plastic': {
            icon: 'fas fa-cube',
            title: 'Plastic Items',
            color: '#3b82f6',
            steps: [
                'Find the recycling number (1-7) in the triangle symbol on the bottom of the item',
                'Numbers 1 (water bottles) and 2 (milk jugs) are most commonly accepted everywhere',
                'Empty the container completely and give it a quick rinse with water',
                'Remove caps and lids - they\'re often different plastic types (check if your area recycles them separately)',
                'Place in your designated plastic recycling bin',
                'Never put plastic bags in curbside bins - they jam the machines!'
            ],
            tips: [
                'Plastic bags: Return to grocery stores - they have special collection bins at the entrance',
                'When in doubt, check your local recycling website or call your waste company',
                'Reduce plastic use: Bring reusable bags, bottles, and containers',
                'Only 9% of all plastic ever made has been recycled - every bit helps!'
            ],
            dontRecycle: ['Plastic bags (take to store)', 'Styrofoam', 'Plastic wrap', 'Chip bags', 'Straws', 'Plastic utensils'],
            alternatives: 'Switch to reusable water bottles, shopping bags, food containers, and glass jars. Choose products with minimal packaging. Support companies using recycled plastic.'
        },
        'paper': {
            icon: 'fas fa-file-alt',
            title: 'Paper Products',
            color: '#f59e0b',
            steps: [
                'Remove plastic windows from envelopes and any tape or labels',
                'Take out paper clips and staples (small amounts left behind are usually OK)',
                'Keep paper completely dry - wet paper clogs recycling machines and can\'t be processed',
                'If you have shredded paper, put it in a paper bag or clear bag before recycling',
                'Place all clean, dry paper in your paper recycling bin',
                'No need to separate types - newspapers, magazines, and office paper can go together'
            ],
            tips: [
                'Greasy pizza boxes and used napkins should go to compost, not recycling',
                'Receipts have thermal coating (feel the shiny side) - these go in trash, not recycling',
                'Recycling 1 ton of paper saves 17 trees and 7,000 gallons of water!',
                'Use both sides of paper before recycling to maximize its life'
            ],
            dontRecycle: ['Wax-coated paper', 'Thermal receipts', 'Tissue/paper towels', 'Food-soiled paper', 'Carbon paper'],
            alternatives: 'Go paperless for bills and statements. Print double-sided. Use digital notes. Buy recycled paper products. Reuse paper as scratch paper before recycling.'
        },
        'glass': {
            icon: 'fas fa-wine-bottle',
            title: 'Glass Items',
            color: '#10b981',
            steps: [
                'Empty the container completely and pour out all liquids',
                'Remove metal or plastic caps and lids (recycle these separately)',
                'Give it a quick rinse with water - doesn\'t need to be spotless, just no food residue',
                'Leave labels on - they burn off during the recycling process',
                'Place carefully in your glass recycling bin (or mixed recycling if your area allows)',
                'Don\'t break the glass - whole containers are easier to process'
            ],
            tips: [
                'Glass is 100% recyclable and can be recycled forever without losing quality!',
                'Recycling glass saves 30% energy compared to making new glass',
                'One ton of recycled glass saves 1.2 tons of raw materials',
                'Some areas require color separation (clear, green, brown) - check local rules'
            ],
            dontRecycle: ['Light bulbs', 'Mirrors', 'Window glass', 'Drinking glasses', 'Ceramics', 'Pyrex'],
            alternatives: 'Reuse glass jars for food storage, crafts, or organizing. Choose products in glass over plastic. Buy refillable glass containers.'
        },
        'metal': {
            icon: 'fas fa-cog',
            title: 'Metal Items',
            color: '#6b7280',
            steps: [
                'Empty the container and rinse out any food residue with water',
                'Labels can stay on - no need to remove them (they\'re burned off during recycling)',
                'Crush aluminum cans by stepping on them to save space (optional but helpful)',
                'Test with a magnet: Magnetic = steel, Non-magnetic = aluminum (both are recyclable!)',
                'Place in your metal recycling bin or mixed recycling',
                'Small metal items like bottle caps can be recycled - just ball them together'
            ],
            tips: [
                'Recycling aluminum saves 95% of the energy needed to make new aluminum!',
                'One recycled aluminum can saves enough energy to run a TV for 3 hours',
                'Aluminum foil and pie tins are recyclable too - just rinse and recycle',
                'Metal is one of the most valuable recyclable materials'
            ],
            dontRecycle: ['Paint cans with wet paint', 'Aerosol cans that still spray', 'Propane tanks', 'Metal with hazardous waste'],
            alternatives: 'Buy in bulk to reduce metal packaging. Choose reusable metal water bottles and food containers. Repair metal items instead of replacing.'
        },
        'cardboard': {
            icon: 'fas fa-box',
            title: 'Cardboard',
            color: '#92400e',
            steps: [
                'Remove everything inside - packing materials, plastic, foam, and products',
                'Pull off packing tape and remove staples (small amounts left behind are usually OK)',
                'Flatten boxes by breaking them down - step on them or cut along the seams',
                'Keep cardboard completely dry - wet cardboard can\'t be recycled',
                'Place flattened cardboard in your recycling bin or tie in bundles',
                'Break down large boxes so they fit in the bin'
            ],
            tips: [
                'Recycling 1 ton of cardboard saves 17 trees and 7,000 gallons of water!',
                'Pizza boxes: If the bottom is greasy, tear off and compost it. Recycle the clean top.',
                'Small cardboard pieces can go with regular paper recycling',
                'Cardboard is one of the easiest and most recycled materials'
            ],
            dontRecycle: ['Wax-coated boxes (produce boxes)', 'Heavily greased cardboard', 'Wet or moldy cardboard'],
            alternatives: 'Reuse boxes for storage, moving, or shipping. Choose products with minimal packaging. Shop at stores that use less cardboard.'
        },
        'battery': {
            icon: 'fas fa-battery-half',
            title: 'Batteries',
            color: '#ef4444',
            steps: [
                'NEVER throw batteries in regular trash or recycling bins!',
                'Identify the type: AA, AAA, 9V, button cells, rechargeable, or car batteries',
                'Store safely: Put in a plastic bag or tape the terminals to prevent fires',
                'Find a collection point: Check Best Buy, Home Depot, Lowe\'s, Walmart, or your local recycling center',
                'Drop off at the battery collection bin (usually near store entrance)',
                'Car batteries: Return to auto parts stores - they often pay you!'
            ],
            tips: [
                'One battery can contaminate 600,000 liters of water with toxic metals!',
                'Rechargeable batteries are especially valuable - they contain rare materials',
                'Call2Recycle.org helps you find the nearest battery drop-off location',
                'Switch to rechargeable batteries - they last longer and reduce waste'
            ],
            dontRecycle: ['Never put in regular trash', 'Never put in curbside recycling', 'Don\'t throw in water or fire'],
            alternatives: 'Use rechargeable batteries (they pay for themselves after 5 uses). Choose solar-powered devices. Buy products with longer battery life.'
        },
        'biological': {
            icon: 'fas fa-seedling',
            title: 'Organic Waste',
            color: '#22c55e',
            steps: [
                'Collect food scraps in a small container on your kitchen counter',
                'Include: Fruit/vegetable peels, coffee grounds, tea bags, eggshells, yard waste',
                'Choose your method: Backyard compost bin, countertop composter, or municipal green bin',
                'Avoid: Meat, dairy, oils, and pet waste (they smell bad and attract pests)',
                'Mix or turn your compost occasionally and keep it moist but not soggy',
                'After 2-6 months, use the nutrient-rich compost for your garden or plants'
            ],
            tips: [
                'Food waste in landfills creates methane gas (28x worse than CO2 for climate!)',
                'Composting reduces your household waste by up to 30%',
                'The finished compost is like "black gold" for plants - free fertilizer!',
                'Even apartment dwellers can compost with small countertop bins'
            ],
            dontRecycle: ['Meat and bones', 'Dairy products', 'Oils and fats', 'Pet waste', 'Diseased plants'],
            alternatives: 'Plan meals to reduce food waste. Store food properly to make it last longer. Donate excess food to food banks. Start a small compost bin even in apartments.'
        },
        'clothes': {
            icon: 'fas fa-tshirt',
            title: 'Textiles & Clothing',
            color: '#8b5cf6',
            steps: [
                'Sort your clothes: Wearable vs. damaged/worn out',
                'Wearable clothes: Wash them and donate to Goodwill, Salvation Army, or local shelters',
                'Damaged clothes: Take to textile recycling bins (H&M, North Face accept any condition)',
                'Get creative: Cut old clothes into cleaning rags, pet bedding, or use for crafts',
                'Tie shoes together in pairs so they don\'t get separated',
                'Some stores give you discount coupons when you recycle clothes!'
            ],
            tips: [
                'The fashion industry creates 10% of global carbon emissions',
                'Extending clothes life by just 9 months reduces environmental impact by 30%',
                'H&M, Zara, North Face, and Patagonia have in-store recycling programs',
                'Even damaged textiles can be recycled into insulation or industrial rags'
            ],
            dontRecycle: ['Heavily contaminated items', 'Items with hazardous materials', 'Underwear (unless new)'],
            alternatives: 'Buy quality clothes that last longer. Repair torn items or take to a tailor. Organize clothing swaps with friends. Shop secondhand first.'
        },
        'shoes': {
            icon: 'fas fa-shoe-prints',
            title: 'Footwear',
            color: '#f97316',
            steps: [
                'Clean off dirt and mud from the shoes',
                'Wearable shoes: Donate to Goodwill, Salvation Army, Soles4Souls, or local shelters',
                'Worn-out athletic shoes: Take to Nike Reuse-A-Shoe program (they grind them into sports surfaces)',
                'Any condition: Drop at textile recycling bins or mail to shoe recycling programs',
                'Tie or lace pairs together so they stay matched',
                'Check if the brand has a take-back program (Nike, DSW, Zappos for Good)'
            ],
            tips: [
                '300 million pairs of shoes end up in landfills every year in the US alone',
                'Shoes take 30-40 years to decompose and release toxic chemicals',
                'Some programs give you discount coupons for your next purchase',
                'Athletic shoes can be ground up and turned into playground surfaces!'
            ],
            dontRecycle: ['Shoes with hazardous materials', 'Heavily contaminated footwear'],
            alternatives: 'Buy quality shoes that last. Get shoes resoled instead of replacing. Consider minimalist footwear. Take care of shoes to extend their life.'
        },
        'trash': {
            icon: 'fas fa-trash',
            title: 'General Waste',
            color: '#374151',
            steps: [
                'Before throwing away, ask yourself: Can this be reused, repaired, or recycled?',
                'Check Earth911.com or your local recycling website for special recycling options',
                'Break down or compress items to save space in landfills',
                'Put waste in proper trash bags to contain it and prevent litter',
                'Place in your general waste bin only as a last resort'
            ],
            tips: [
                'Average person creates 4.5 pounds of trash every single day',
                'Landfills release methane gas and can contaminate groundwater',
                'The best waste is the waste you never create - reduce first!',
                'Many "trash" items have specialized recycling - always check first'
            ],
            dontRecycle: ['Items that can be recycled', 'Items that can be composted', 'Items that can be donated'],
            alternatives: 'Buy products with less packaging. Choose reusable over disposable. Repair broken items. Donate unwanted items. Borrow or rent instead of buying.'
        }
    };

    function renderGuides() {
        const html = Object.entries(wasteGuides).map(([key, guide]) => `
            <div class="guide-card" data-category="${key}">
                <div class="guide-header" style="border-left: 4px solid ${guide.color}">
                    <div class="guide-icon" style="color: ${guide.color}">
                        <i class="${guide.icon}"></i>
                    </div>
                    <h3>${guide.title}</h3>
                </div>
                <div class="guide-content">
                    <div class="guide-section">
                        <h4><i class="fas fa-list-ol"></i> How to Recycle</h4>
                        <ol>
                            ${guide.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    <div class="guide-section">
                        <h4><i class="fas fa-lightbulb"></i> Pro Tips</h4>
                        <ul>
                            ${guide.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="guide-section">
                        <h4><i class="fas fa-times-circle"></i> Don't Recycle</h4>
                        <div class="dont-recycle">
                            ${guide.dontRecycle.map(item => `<span class="dont-item">${item}</span>`).join('')}
                        </div>
                    </div>
                    <div class="guide-section">
                        <h4><i class="fas fa-leaf"></i> Eco Alternatives</h4>
                        <p class="alternatives">${guide.alternatives}</p>
                    </div>
                </div>
            </div>
        `).join('');

        guideCategories.innerHTML = html;
    }

    function filterGuides(searchTerm) {
        const cards = document.querySelectorAll('.guide-card');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(term)) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
    }

    // Event listeners
    guideSearch.addEventListener('input', (e) => {
        filterGuides(e.target.value);
    });

    // Initialize
    renderGuides();

    // Make guide data globally accessible for other pages
    window.wasteGuides = wasteGuides;
});