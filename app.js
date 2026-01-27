// Initialize map
const map = L.map('map').setView([45.5, 10], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Custom markers
function getMarkerColor(category) {
    switch(category) {
        case 'top': return '#10b981';
        case 'ok': return '#f59e0b';
        case 'no': return '#ef4444';
        default: return '#6b7280';
    }
}

function createCustomIcon(category, rank) {
    const color = getMarkerColor(category);
    const label = rank || '';

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: ${color};
            width: ${rank ? '28px' : '20px'};
            height: ${rank ? '28px' : '20px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        ">${label}</div>`,
        iconSize: [rank ? 28 : 20, rank ? 28 : 20],
        iconAnchor: [rank ? 14 : 10, rank ? 14 : 10]
    });
}

// Add markers for all accommodations
accommodations.forEach(acc => {
    // Determine if it should show a rank number
    let rank = null;
    if (acc.claudeRank && acc.claudeRank <= 3) {
        rank = acc.claudeRank;
    } else if (acc.chatgptRank && acc.chatgptRank <= 3) {
        rank = acc.chatgptRank;
    }

    const marker = L.marker([acc.lat, acc.lng], {
        icon: createCustomIcon(acc.category, rank)
    }).addTo(map);

    // Create popup content
    const popupContent = `
        <div style="min-width: 220px;">
            <h4 style="margin: 0 0 5px 0;">${acc.name}</h4>
            <p style="margin: 0 0 8px 0; color: #666;">${acc.region}</p>
            ${acc.price ? `<p style="margin: 0 0 8px 0; font-size: 1rem; font-weight: 600; color: #059669;">${acc.price}</p>` : ''}
            <p style="margin: 0 0 5px 0; font-size: 0.85rem;">
                <strong>Sovrum:</strong> ${acc.bedrooms} |
                <strong>Gäster:</strong> ${acc.guests}
            </p>
            <p style="margin: 0 0 5px 0; font-size: 0.85rem;">
                <strong>Pool:</strong> ${acc.pool}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 0.85rem;">
                <strong>Nära by:</strong> ${acc.byKrav}
            </p>
            ${acc.claudeRank ? `<span style="background: #d97706; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-right: 5px;">Claude #${acc.claudeRank}</span>` : ''}
            ${acc.chatgptRank ? `<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">ChatGPT #${acc.chatgptRank}</span>` : ''}
            <br><br>
            <a href="${acc.link}" target="_blank" style="color: #667eea;">Visa boende &rarr;</a>
        </div>
    `;

    marker.bindPopup(popupContent);
});

// Add start point marker (Hjärup)
const startIcon = L.divIcon({
    className: 'start-marker',
    html: `<div style="
        background: #667eea;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
    ">H</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
    .addTo(map)
    .bindPopup('<strong>Hjärup</strong><br>Startpunkt');

// Fit bounds to show all markers
const bounds = L.latLngBounds(accommodations.map(a => [a.lat, a.lng]));
bounds.extend([startPoint.lat, startPoint.lng]);
map.fitBounds(bounds, { padding: [50, 50] });

// Render accommodation cards
function renderAccommodations(filter = 'all') {
    const grid = document.getElementById('accommodations-grid');
    grid.innerHTML = '';

    const filtered = filter === 'all'
        ? accommodations
        : accommodations.filter(a => a.category === filter);

    filtered.forEach(acc => {
        const card = document.createElement('div');
        card.className = `accommodation-card ${acc.category}`;

        const claudeStars = acc.claudeScore ? '★'.repeat(acc.claudeScore) + '☆'.repeat(5 - acc.claudeScore) : '-';
        const chatgptStars = acc.chatgptScore ? '★'.repeat(acc.chatgptScore) + '☆'.repeat(5 - acc.chatgptScore) : '-';

        card.innerHTML = `
            <h4>${acc.name}</h4>
            <div class="region">${acc.region}</div>
            ${acc.price ? `<div class="price">${acc.price} <span class="price-note">${acc.priceNote || ''}</span></div>` : ''}
            <div class="details">
                <span class="detail">${acc.bedrooms} sovrum</span>
                <span class="detail">${acc.guests} gäster</span>
                <span class="detail">${acc.pool}</span>
            </div>
            <div class="scores">
                ${acc.claudeRank ? `<span class="score"><span class="score-label">Claude:</span> <strong>#${acc.claudeRank}</strong></span>` : `<span class="score"><span class="score-label">Claude:</span> ${claudeStars}</span>`}
                ${acc.chatgptRank ? `<span class="score"><span class="score-label">ChatGPT:</span> <strong>#${acc.chatgptRank}</strong></span>` : `<span class="score"><span class="score-label">ChatGPT:</span> ${chatgptStars}</span>`}
            </div>
            <p class="comment">${acc.comment}</p>
            <a href="${acc.link}" target="_blank" class="card-link">Visa boende &rarr;</a>
        `;

        grid.appendChild(card);
    });
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderAccommodations(this.dataset.filter);
    });
});

// Initial render
renderAccommodations();
