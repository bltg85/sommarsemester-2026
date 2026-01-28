// Gruppens favoriter (ID:n för boenden som någon har röstat på)
const groupFavorites = {
    'Sofie': { first: 10, second: null, third: null },      // Novasol Barolo
    'Sofia': { first: 9, second: 10, third: null },         // Arezzo, Barolo
    'Caroline': { first: 4, second: null, third: null },    // Vista dai Colli
    'Henrik': { first: null, second: null, third: null },
    'Anders': { first: null, second: null, third: null },
    'Stefan': { first: null, second: null, third: null }
};

// Hämta alla unika favorit-ID:n
function getFavoriteIds() {
    const ids = new Set();
    Object.values(groupFavorites).forEach(votes => {
        if (votes.first) ids.add(votes.first);
        if (votes.second) ids.add(votes.second);
        if (votes.third) ids.add(votes.third);
    });
    return ids;
}

// Räkna röster för ett boende
function countVotes(accId) {
    let votes = 0;
    let voters = [];
    Object.entries(groupFavorites).forEach(([name, prefs]) => {
        if (prefs.first === accId) { votes += 3; voters.push(`${name} #1`); }
        if (prefs.second === accId) { votes += 2; voters.push(`${name} #2`); }
        if (prefs.third === accId) { votes += 1; voters.push(`${name} #3`); }
    });
    return { votes, voters };
}

// Custom markers
function getMarkerColor(category) {
    switch(category) {
        case 'top': return '#10b981';
        case 'ok': return '#f59e0b';
        case 'no': return '#ef4444';
        default: return '#6b7280';
    }
}

function createCustomIcon(category, rank, isFavorite = false) {
    const color = isFavorite ? '#667eea' : getMarkerColor(category);
    const label = rank || '';
    const size = rank ? 28 : (isFavorite ? 24 : 20);

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: ${color};
            width: ${size}px;
            height: ${size}px;
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
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
}

function createFavoriteIcon(voteCount) {
    const size = 32;
    return L.divIcon({
        className: 'favorite-marker',
        html: `<div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
        ">★</div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
}

// Start point icon
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

// Create popup content
function createPopupContent(acc, showVotes = false) {
    const voteInfo = countVotes(acc.id);
    const voteHtml = showVotes && voteInfo.votes > 0
        ? `<p style="margin: 0 0 8px 0; font-size: 0.9rem; background: #e0e7ff; padding: 5px 10px; border-radius: 4px;">
            <strong>👥 Röster:</strong> ${voteInfo.voters.join(', ')}
           </p>`
        : '';

    const addressHtml = acc.address
        ? `<p style="margin: 0 0 5px 0; font-size: 0.8rem; color: #888;">📍 ${acc.address}</p>`
        : '';

    const mapsLink = acc.googleMaps
        ? `<a href="${acc.googleMaps}" target="_blank" style="color: #059669; font-size: 0.8rem; margin-right: 10px;">Google Maps</a>`
        : '';

    return `
        <div style="min-width: 240px;">
            <h4 style="margin: 0 0 5px 0;">${acc.name}</h4>
            <p style="margin: 0 0 8px 0; color: #666;">${acc.region}</p>
            ${addressHtml}
            ${voteHtml}
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
            ${mapsLink}
            <a href="${acc.link}" target="_blank" style="color: #667eea;">Visa boende &rarr;</a>
        </div>
    `;
}

// ============ FAVORITES MAP ============
const favoritesMap = L.map('favorites-map').setView([45.5, 8], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(favoritesMap);

// Add start point to favorites map
L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
    .addTo(favoritesMap)
    .bindPopup('<strong>Hjärup</strong><br>Startpunkt');

// Add favorite accommodations to favorites map
const favoriteIds = getFavoriteIds();
const favoriteAccommodations = accommodations.filter(a => favoriteIds.has(a.id));

favoriteAccommodations.forEach(acc => {
    const voteInfo = countVotes(acc.id);
    const marker = L.marker([acc.lat, acc.lng], {
        icon: createFavoriteIcon(voteInfo.votes)
    }).addTo(favoritesMap);
    marker.bindPopup(createPopupContent(acc, true));
});

// Fit favorites map bounds
if (favoriteAccommodations.length > 0) {
    const favBounds = L.latLngBounds(favoriteAccommodations.map(a => [a.lat, a.lng]));
    favBounds.extend([startPoint.lat, startPoint.lng]);
    favoritesMap.fitBounds(favBounds, { padding: [50, 50] });
}

// ============ FULL MAP ============
const map = L.map('map').setView([45.5, 10], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Add markers for all accommodations
accommodations.forEach(acc => {
    let rank = null;
    if (acc.claudeRank && acc.claudeRank <= 3) {
        rank = acc.claudeRank;
    } else if (acc.chatgptRank && acc.chatgptRank <= 3) {
        rank = acc.chatgptRank;
    }

    const isFavorite = favoriteIds.has(acc.id);
    const marker = L.marker([acc.lat, acc.lng], {
        icon: createCustomIcon(acc.category, rank, isFavorite)
    }).addTo(map);

    marker.bindPopup(createPopupContent(acc, true));
});

// Add start point marker (Hjärup)
L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
    .addTo(map)
    .bindPopup('<strong>Hjärup</strong><br>Startpunkt');

// Fit bounds to show all markers
const bounds = L.latLngBounds(accommodations.map(a => [a.lat, a.lng]));
bounds.extend([startPoint.lat, startPoint.lng]);
map.fitBounds(bounds, { padding: [50, 50] });

// ============ ACCOMMODATION CARDS ============
function renderAccommodations(filter = 'all') {
    const grid = document.getElementById('accommodations-grid');
    grid.innerHTML = '';

    const filtered = filter === 'all'
        ? accommodations
        : accommodations.filter(a => a.category === filter);

    filtered.forEach(acc => {
        const card = document.createElement('div');
        const isFavorite = favoriteIds.has(acc.id);
        card.className = `accommodation-card ${acc.category}`;
        if (isFavorite) {
            card.style.borderLeft = '4px solid #667eea';
            card.style.background = 'linear-gradient(135deg, #f8f9ff 0%, #fff 100%)';
        }

        const claudeStars = acc.claudeScore ? '★'.repeat(acc.claudeScore) + '☆'.repeat(5 - acc.claudeScore) : '-';
        const chatgptStars = acc.chatgptScore ? '★'.repeat(acc.chatgptScore) + '☆'.repeat(5 - acc.chatgptScore) : '-';

        const voteInfo = countVotes(acc.id);
        const voteHtml = voteInfo.votes > 0
            ? `<div style="background: #e0e7ff; padding: 5px 10px; border-radius: 4px; margin-bottom: 10px; font-size: 0.85rem;">
                👥 <strong>${voteInfo.voters.join(', ')}</strong>
               </div>`
            : '';

        card.innerHTML = `
            <h4>${acc.name} ${isFavorite ? '⭐' : ''}</h4>
            <div class="region">${acc.region}</div>
            ${voteHtml}
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
