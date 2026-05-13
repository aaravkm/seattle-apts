'use strict';

// ── Supabase ───────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://frxrbrvfnkopnaebclkb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHJicnZmbmtvcG5hZWJjbGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkyNzgsImV4cCI6MjA5Mzg0NTI3OH0.BJBeYfja8yAocjaZIJCdSguNe0r4GCPofJhi9TFTOTo';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_AMENITIES = ['Gym', 'Pool', 'Rooftop', 'Lounge', 'Package Locker'];
const PREFS_KEY = 'seattle-apts-prefs';
const GEO_CACHE_KEY = 'seattle-apts-geo';

// ── State ──────────────────────────────────────────────────────────────────
let state = {
    apts: [],
    work: '1201 2nd Ave Suite 1900, Seattle, WA 98101',
    nextId: 1,
};

let currentSort   = 'default';
let openDetailId  = null;
let migrating     = false;

// Load prefs from localStorage
try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
    if (prefs.work !== undefined) state.work = prefs.work;
} catch {}

const savePrefs = () => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ work: state.work })); } catch {}
};

// ── Geo cache ──────────────────────────────────────────────────────────────
let geoCache = {};
try { geoCache = JSON.parse(localStorage.getItem(GEO_CACHE_KEY)) || {}; } catch {}
const saveGeoCache = () => { try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geoCache)); } catch {} };
const realWalkTimes = {};

// ── Pure helpers ───────────────────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const or  = (v, fb = '—') => (v != null && v !== '') ? v : fb;

function mapsUrl(from, to, mode) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${mode}`;
}
function groceryMapsUrl(address) {
    return `https://www.google.com/maps/search/grocery+stores+near+${encodeURIComponent(address)}`;
}
function haversine(lat1, lon1, lat2, lon2) {
    const R = 3958.8, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

function minPrice(apt) {
    const prices = (apt.units || []).map(u => u.price).filter(p => p != null && p > 0);
    return prices.length ? Math.min(...prices) : null;
}
function maxPrice(apt) {
    const prices = (apt.units || []).map(u => u.price).filter(p => p != null && p > 0);
    return prices.length ? Math.max(...prices) : null;
}
function maxSqft(apt) {
    const sqfts = (apt.units || []).map(u => u.sqft).filter(s => s != null && s > 0);
    return sqfts.length ? Math.max(...sqfts) : null;
}

function unitSummary(apt) {
    const units = apt.units || [];
    const types = [...new Set(units.map(u => u.type).filter(Boolean))].join(' / ');
    const lo = minPrice(apt), hi = maxPrice(apt);
    const priceStr = lo == null ? '—' : lo === hi || hi == null ? `$${lo.toLocaleString()}` : `$${lo.toLocaleString()}–$${hi.toLocaleString()}`;
    const sqfts = units.map(u => u.sqft).filter(Boolean);
    const sqftStr = sqfts.length ? (Math.min(...sqfts) === Math.max(...sqfts) ? `${Math.min(...sqfts)} sf` : `${Math.min(...sqfts)}–${Math.max(...sqfts)} sf`) : '';
    return [types, priceStr, sqftStr].filter(Boolean).join(' · ');
}

function getAmenityOptions() {
    const extra = new Set();
    state.apts.forEach(a => (a.buildingAmenities || []).forEach(x => {
        if (!DEFAULT_AMENITIES.includes(x)) extra.add(x);
    }));
    return [...DEFAULT_AMENITIES, ...[...extra].sort()];
}

// ── Migration ──────────────────────────────────────────────────────────────
function parseAmenitiesString(str) {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean).map(t => {
        const match = DEFAULT_AMENITIES.find(d => d.toLowerCase() === t.toLowerCase() || t.toLowerCase().includes(d.toLowerCase()));
        return match || (t.charAt(0).toUpperCase() + t.slice(1));
    }).filter((v, i, arr) => arr.indexOf(v) === i);
}

function migrateApt(a) {
    // URLs
    a.listingUrl = a.url || a.listingUrl || '';
    a.websiteUrl = a.websiteUrl || '';
    delete a.url;

    // Units
    if (!Array.isArray(a.units)) {
        a.units = [{
            id: `${a.id}-0`,
            type: a.type || '',
            unitNumber: '',
            sqft: a.sqft ?? null,
            price: a.rent ?? null,
            available: a.dateAvailable || 'now',
        }];
    }

    // Building amenities
    if (!Array.isArray(a.buildingAmenities)) {
        a.buildingAmenities = parseAmenitiesString(a.amenities || '');
    }

    // Google rating
    if (!a.googleRating) a.googleRating = '';

    // Merge old separate comments into one
    if (!a.comments) {
        const parts = [];
        if (a.commentIshita?.trim())  parts.push(`Ishita: ${a.commentIshita.trim()}`);
        if (a.commentIshmeet?.trim()) parts.push(`Ishmeet: ${a.commentIshmeet.trim()}`);
        if (a.commentJyotsna?.trim()) parts.push(`Jyotsna: ${a.commentJyotsna.trim()}`);
        if (a.commentAarav?.trim())   parts.push(`Aarav: ${a.commentAarav.trim()}`);
        a.comments = parts.join('\n\n');
    }

    // Interaction fields
    if (!a.holdDays)     a.holdDays     = '';
    if (!a.phone)        a.phone        = '';
    if (!a.contactName)  a.contactName  = '';
    if (a.called  == null) a.called     = false;
    if (!a.tourType)     a.tourType     = '';
    if (!a.specialOffers) a.specialOffers = '';
    if (!a.notes)        a.notes        = '';

    // sortOrder
    if (a.sortOrder == null) a.sortOrder = a.id * 10;

    // Photos
    if (!Array.isArray(a.photos)) a.photos = [];

    // Preserve starred before deleting old fields
    const wasStarred = a.starred ?? false;

    // Delete old fields
    for (const k of ['type','sqft','sqftNote','rent','rentMax','estUtils',
                      'dateAvailable','leaseMonths','heating','amenities',
                      'greenFlags','redFlags','rating','rentVerified',
                      'amenitiesVerified','dataNote','addedBy',
                      'nearbyTransit','walkToWork','transitToWork',
                      'nearbyGrocery',
                      'commentIshita','commentIshmeet','commentJyotsna','commentAarav']) {
        delete a[k];
    }

    a.starred = wasStarred;
}

// ── Supabase layer ─────────────────────────────────────────────────────────
async function saveApt(apt) {
    const { error } = await sb.from('apartments').upsert({ id: apt.id, apt });
    if (error) console.error('Save failed:', error);
}

async function deleteAptFromDb(id) {
    const { error } = await sb.from('apartments').delete().eq('id', id);
    if (error) console.error('Delete failed:', error);
}

async function loadApts() {
    const { data, error } = await sb.from('apartments').select('apt');
    if (error) { console.error('Load failed:', error); return; }

    const migrated = [];
    state.apts = (data || []).map(r => {
        const apt = r.apt;
        if (!Array.isArray(apt.units)) {
            migrateApt(apt);
            migrated.push(apt);
        }
        // Ensure all required fields exist
        if (!Array.isArray(apt.photos))            apt.photos            = [];
        if (!Array.isArray(apt.buildingAmenities)) apt.buildingAmenities = [];
        if (!Array.isArray(apt.units))             apt.units             = [];
        if (apt.sortOrder == null)                 apt.sortOrder         = apt.id * 10;
        if (apt.starred   == null)                 apt.starred           = false;
        return apt;
    });

    // Persist migrated records
    if (migrated.length) {
        migrating = true;
        await Promise.all(migrated.map(saveApt));
        migrating = false;
    }

    state.nextId = Math.max(...state.apts.map(a => a.id), 0) + 1;
    renderList();
    computeWalkTimes();
}

function createBlankApt() {
    const id = state.nextId++;
    const maxOrder = state.apts.reduce((m, a) => Math.max(m, a.sortOrder ?? 0), 0);
    return {
        id, name: '', address: '', neighborhood: '',
        googleRating: '', websiteUrl: '', listingUrl: '',
        buildingAmenities: [],
        ac: null, washerDryer: '', dishwasher: null,
        utilitiesIncluded: '',
        units: [{ id: `${id}-0`, type: '', unitNumber: '', sqft: null, price: null, available: 'now' }],
        holdDays: '', phone: '', contactName: '',
        called: false, tourType: '', specialOffers: '',
        comments: '', notes: '',
        photos: [], starred: false,
        sortOrder: maxOrder + 10,
    };
}

// ── Real-time ──────────────────────────────────────────────────────────────
sb.channel('apartments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'apartments' }, () => {
        if (migrating) return;
        loadApts();
    })
    .subscribe();

// ── Walk time ──────────────────────────────────────────────────────────────
async function geocode(address) {
    if (geoCache[address]) return geoCache[address];
    try {
        const res  = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'SeattleAptFinder/1.0' } }
        );
        const data = await res.json();
        if (!data[0]) return null;
        const coords = { lat: +data[0].lat, lon: +data[0].lon };
        geoCache[address] = coords;
        saveGeoCache();
        return coords;
    } catch { return null; }
}

async function computeWalkTimes() {
    const workAddr = state.work.trim();
    if (!workAddr) return;
    const workCoords = await geocode(workAddr);
    if (!workCoords) return;

    const aptsWithAddr = state.apts.filter(a => a.address?.trim());
    const coordsList = [];
    for (const apt of aptsWithAddr) {
        if (!geoCache[apt.address]) await new Promise(r => setTimeout(r, 1100));
        coordsList.push(await geocode(apt.address));
    }

    const validPairs = aptsWithAddr.map((apt, i) => ({ apt, coords: coordsList[i] })).filter(x => x.coords);
    if (!validPairs.length) return;

    const allCoords = [workCoords, ...validPairs.map(x => x.coords)];
    const coordStr  = allCoords.map(c => `${c.lon},${c.lat}`).join(';');

    try {
        const res  = await fetch(`https://router.project-osrm.org/table/v1/foot/${coordStr}?sources=0&annotations=duration`);
        const data = await res.json();
        if (data.code !== 'Ok') return;
        validPairs.forEach(({ apt }, i) => {
            const secs = data.durations[0][i + 1];
            if (secs != null) realWalkTimes[apt.id] = `${Math.round(secs / 60)} min`;
        });
        // Update walk times in list without full re-render
        validPairs.forEach(({ apt }) => {
            const el = document.querySelector(`.apt-row[data-id="${apt.id}"] .row-walk`);
            if (el) el.textContent = realWalkTimes[apt.id] || '';
        });
        // Also update open detail modal if showing
        if (openDetailId != null) {
            const el = document.getElementById('detailWalkTime');
            if (el) el.textContent = realWalkTimes[openDetailId] || '—';
        }
    } catch {}
}

// ── Grocery lookup ─────────────────────────────────────────────────────────
async function findNearbyGroceries(aptId) {
    const a  = state.apts.find(x => x.id === aptId);
    const el = document.getElementById('groceryResults');
    if (!a || !a.address || !el) { if (el) el.innerHTML = ''; return; }

    const mapsBtn = `<a class="link-btn grocery-maps-btn" href="${groceryMapsUrl(a.address)}" target="_blank">🗺 View on Google Maps</a>`;

    try {
        const geoRes  = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(a.address)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'SeattleAptFinder/1.0' } }
        );
        const geoData = await geoRes.json();
        if (!geoData.length) { el.innerHTML = `<span class="no-info">Could not locate address.</span>`; return; }

        const { lat, lon } = geoData[0];
        const q = `[out:json][timeout:12];(node["shop"~"supermarket|grocery"](around:1000,${lat},${lon});way["shop"~"supermarket|grocery"](around:1000,${lat},${lon});node["shop"="convenience"](around:600,${lat},${lon}););out center;`;

        const opRes  = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) });
        const opData = await opRes.json();

        const stores = opData.elements
            .map(el => {
                const eLat = el.lat ?? el.center?.lat, eLon = el.lon ?? el.center?.lon;
                if (!eLat || !eLon || !el.tags?.name) return null;
                return { name: el.tags.name, type: el.tags.shop, dist: haversine(+lat, +lon, eLat, eLon) };
            })
            .filter(Boolean).sort((a, b) => a.dist - b.dist).slice(0, 5);

        if (!stores.length) { el.innerHTML = `<span class="no-info">No stores found nearby.</span>${mapsBtn}`; return; }

        const distStr = d => d < 0.12 ? `${Math.round(d * 5280)} ft` : `${d.toFixed(2)} mi`;
        const walkMin = d => Math.max(1, Math.round(d * 20));
        const typeIcon = t => t === 'supermarket' ? '🏪' : t === 'convenience' ? '🏬' : '🛒';

        el.innerHTML = `
            <div class="grocery-list">
                ${stores.map(s => `
                <div class="grocery-item">
                    <span class="grocery-icon">${typeIcon(s.type)}</span>
                    <span class="grocery-name">${esc(s.name)}</span>
                    <span class="grocery-dist">${distStr(s.dist)} · ${walkMin(s.dist)} min walk</span>
                </div>`).join('')}
            </div>
            ${mapsBtn}`;
    } catch {
        el.innerHTML = `<span class="no-info">Could not load store data.</span>`;
    }
}

// ── Image compression ──────────────────────────────────────────────────────
function compressImage(file, maxDim = 1100, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = e => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const scale  = Math.min(1, maxDim / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width  = Math.round(img.width  * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function photoRowHtml(photo) {
    const url     = photo?.url     || '';
    const caption = photo?.caption || '';
    const isData  = url.startsWith('data:');
    return `
    <div class="photo-row">
        <div class="photo-thumb">${url ? `<img src="${esc(url)}" onerror="this.style.display='none'">` : ''}</div>
        <div class="photo-fields">
            ${isData
                ? `<div class="photo-uploaded-badge">📷 Uploaded</div><input type="hidden" class="photo-url" value="${esc(url)}">`
                : `<input type="text" class="photo-url" placeholder="Image URL https://…" value="${esc(url)}">`}
            <input type="text" class="photo-caption" placeholder="Caption (optional)" value="${esc(caption)}">
        </div>
        <button type="button" class="photo-del" onclick="this.closest('.photo-row').remove()">×</button>
    </div>`;
}

window.addPhotoRow = function(photo = null) {
    const container = document.getElementById('photosContainer');
    if (!container) return;
    const div = document.createElement('div');
    div.innerHTML = photoRowHtml(photo || {});
    const row = div.firstElementChild;
    container.appendChild(row);
    const urlInput = row.querySelector('input.photo-url:not([type=hidden])');
    const thumbImg = row.querySelector('.photo-thumb img');
    if (urlInput) {
        urlInput.addEventListener('input', () => {
            if (!thumbImg) {
                const img = document.createElement('img');
                row.querySelector('.photo-thumb').appendChild(img);
            }
            row.querySelector('.photo-thumb img').src = urlInput.value;
        });
    }
    if (!photo?.url) urlInput?.focus();
};

window.handlePhotoUpload = async function(files) {
    const uploadBtn = document.getElementById('uploadPhotosBtn');
    if (uploadBtn) { uploadBtn.textContent = '⏳ Uploading…'; uploadBtn.disabled = true; }
    for (const file of Array.from(files)) {
        try {
            const dataUrl = await compressImage(file);
            const res     = await fetch(dataUrl);
            const blob    = await res.blob();
            const path    = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            const { error } = await sb.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
            if (error) throw error;
            const { data: { publicUrl } } = sb.storage.from('photos').getPublicUrl(path);
            addPhotoRow({ url: publicUrl, caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') });
        } catch (err) {
            console.error('Photo upload failed:', err);
            showToast('Photo upload failed — check console');
        }
    }
    if (uploadBtn) { uploadBtn.textContent = '📷 Upload photos'; uploadBtn.disabled = false; }
    const fi = document.getElementById('photoFileInput');
    if (fi) fi.value = '';
};

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, duration = 2500) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
}

// ── Filter / sort ──────────────────────────────────────────────────────────
function getVisible() {
    const fType = document.getElementById('fType').value;
    const fRent = +document.getElementById('fRent').value || Infinity;
    const fWD   = document.getElementById('fWD').value;
    const fAC   = document.getElementById('fAC').checked;
    const fDW   = document.getElementById('fDW').checked;
    const fStar = document.getElementById('fStar').checked;

    let list = state.apts.filter(a => {
        if (fType && !(a.units || []).some(u => u.type === fType)) return false;
        if (fRent < Infinity) {
            const lo = minPrice(a);
            if (lo == null || lo > fRent) return false;
        }
        if (fWD && a.washerDryer !== fWD) return false;
        if (fAC  && !a.ac)        return false;
        if (fDW  && !a.dishwasher) return false;
        if (fStar && !a.starred)   return false;
        return true;
    });

    if (currentSort === 'default') {
        list.sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
    } else if (currentSort === 'priceAsc') {
        list.sort((a, b) => (minPrice(a) ?? 99999) - (minPrice(b) ?? 99999));
    } else if (currentSort === 'priceDesc') {
        list.sort((a, b) => (minPrice(b) ?? 0) - (minPrice(a) ?? 0));
    } else if (currentSort === 'area') {
        list.sort((a, b) => (maxSqft(b) ?? 0) - (maxSqft(a) ?? 0));
    }

    return list;
}

// ── List rendering ─────────────────────────────────────────────────────────
function rowHtml(a) {
    const walk    = realWalkTimes[a.id] || '';
    const isDrag  = currentSort === 'default';
    return `
    <div class="apt-row${a.starred ? ' starred' : ''}${isDrag ? '' : ' drag-disabled'}"
         data-id="${a.id}"
         draggable="${isDrag}">
        <span class="row-drag" title="Drag to reorder">⠿</span>
        <button class="row-star" title="${a.starred ? 'Unstar' : 'Star'}"
                onclick="toggleStar(${a.id}, event)">${a.starred ? '⭐' : '☆'}</button>
        <div class="row-main" onclick="openDetail(${a.id})">
            <div class="row-name">${esc(a.name || 'Unnamed')}</div>
            <div class="row-sub">
                ${a.neighborhood ? `<span class="row-hood">${esc(a.neighborhood)}</span><span class="row-sep">·</span>` : ''}
                <span>${esc(unitSummary(a))}</span>
            </div>
        </div>
        <div class="row-badges">
            ${a.washerDryer === 'unit'     ? '<span class="badge badge-green">W/D</span>'    : ''}
            ${a.ac                         ? '<span class="badge badge-blue">AC</span>'       : ''}
            ${a.dishwasher                 ? '<span class="badge badge-green">DW</span>'      : ''}
            ${a.called                     ? '<span class="badge badge-orange">Called</span>' : ''}
        </div>
        <span class="row-walk">${esc(walk)}</span>
    </div>`;
}

function renderList() {
    const list  = getVisible();
    const el    = document.getElementById('list');
    const empty = document.getElementById('empty');
    const count = document.getElementById('aptCount');

    count.textContent = `${state.apts.length} buildings · ${list.length} shown`;

    if (!list.length) {
        el.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    el.innerHTML = list.map(rowHtml).join('');
    if (currentSort === 'default') attachDragListeners();
}

// ── Drag and drop ──────────────────────────────────────────────────────────
let dragSrcId = null;

function attachDragListeners() {
    document.querySelectorAll('.apt-row[draggable=true]').forEach(row => {
        row.addEventListener('dragstart', e => {
            dragSrcId = +row.dataset.id;
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            document.querySelectorAll('.apt-row.drag-over').forEach(r => r.classList.remove('drag-over'));
        });
        row.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            document.querySelectorAll('.apt-row.drag-over').forEach(r => r.classList.remove('drag-over'));
            row.classList.add('drag-over');
        });
        row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
        row.addEventListener('drop', async e => {
            e.preventDefault();
            row.classList.remove('drag-over');
            const dropId = +row.dataset.id;
            if (dragSrcId === dropId) return;

            const visibleIds = getVisible().map(a => a.id);
            const srcIdx = visibleIds.indexOf(dragSrcId);
            const dstIdx = visibleIds.indexOf(dropId);
            if (srcIdx < 0 || dstIdx < 0) return;

            // Reorder
            visibleIds.splice(srcIdx, 1);
            visibleIds.splice(dstIdx, 0, dragSrcId);

            // Reassign sortOrder and save changed ones
            const toSave = [];
            visibleIds.forEach((id, i) => {
                const a = state.apts.find(x => x.id === id);
                if (!a) return;
                const newOrder = (i + 1) * 10;
                if (a.sortOrder !== newOrder) {
                    a.sortOrder = newOrder;
                    toSave.push(a);
                }
            });
            renderList();
            await Promise.all(toSave.map(saveApt));
        });
    });
}

// ── Sort buttons ───────────────────────────────────────────────────────────
function setSortMode(mode) {
    currentSort = mode;
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === mode);
    });
    renderList();
}

// ── Detail modal ───────────────────────────────────────────────────────────
function unitsTableHtml(units) {
    const rows = (units || []).map(u => `
        <tr class="unit-row" data-unit-id="${esc(u.id)}">
            <td><input class="unit-type"      type="text"   value="${esc(u.type)}"       placeholder="Studio / 1bd/1ba"></td>
            <td><input class="unit-number"    type="text"   value="${esc(u.unitNumber)}" placeholder="4B"></td>
            <td><input class="unit-sqft"      type="number" value="${u.sqft  ?? ''}"     placeholder="650"></td>
            <td><input class="unit-price"     type="number" value="${u.price ?? ''}"     placeholder="1650"></td>
            <td><input class="unit-available" type="text"   value="${esc(u.available || 'now')}" placeholder="now"></td>
            <td><button type="button" class="unit-del-btn" onclick="deleteUnitRow(this)">×</button></td>
        </tr>`).join('');

    return `
    <table class="units-table" id="unitsTable">
        <thead><tr>
            <th>Type</th><th>Unit #</th><th>Sqft</th><th>$/mo</th><th>Available</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table>
    <button type="button" class="link-btn" style="margin-top:8px" onclick="addUnitRow()">+ Add unit</button>`;
}

function amenityChecklistHtml(apt) {
    const opts = getAmenityOptions();
    const checks = opts.map(opt => `
        <label class="amenity-cb-label">
            <input type="checkbox" class="amenity-cb" value="${esc(opt)}"${(apt.buildingAmenities || []).includes(opt) ? ' checked' : ''}>
            ${esc(opt)}
        </label>`).join('');
    return `
    <div class="amenity-checklist" id="amenityChecklist">${checks}</div>
    <button type="button" class="link-btn" style="margin-top:8px" onclick="addCustomAmenity()">+ Add amenity</button>`;
}

function detailModalHtml(a) {
    const work = state.work.trim();
    const directionsHref = work && a.address ? mapsUrl(a.address, work, 'walking') : '#';

    return `
    <button class="modal-close" onclick="closeModal('detailOverlay')">×</button>

    <div class="d-header">
        <div class="d-header-top">
            <button class="d-star-btn" id="detailStarBtn"
                    onclick="toggleStar(${a.id}, event)">${a.starred ? '⭐' : '☆'}</button>
            <input id="detailName" class="d-name-input" type="text"
                   value="${esc(a.name)}" placeholder="Building name">
        </div>
        <div class="d-header-row2">
            <input id="detailNeighborhood" class="d-inline-input" type="text"
                   value="${esc(a.neighborhood)}" placeholder="Neighborhood">
            <span class="d-sep">·</span>
            <span class="d-rating-label">Google</span>
            <input id="detailGoogleRating" class="d-inline-input d-rating-input" type="text"
                   value="${esc(a.googleRating)}" placeholder="4.2">
        </div>
        <div class="d-links">
            <a class="link-btn" href="${esc(a.websiteUrl || '#')}" target="_blank"
               style="${a.websiteUrl ? '' : 'opacity:0.45;pointer-events:none'}">🏠 Website</a>
            <a class="link-btn" href="${esc(a.listingUrl || '#')}" target="_blank"
               style="${a.listingUrl ? '' : 'opacity:0.45;pointer-events:none'}">🔗 Listing</a>
            <a class="link-btn" href="${directionsHref}" target="_blank"
               style="${work && a.address ? '' : 'opacity:0.45;pointer-events:none'}">🗺 Directions</a>
            <button class="link-btn" id="autoFillBtn" onclick="autoFill(${a.id})">✨ Auto-fill</button>
        </div>
    </div>

    <div class="d-body">

        <div class="d-section">
            <h3>Address & Links</h3>
            <div class="d-field">
                <label>Address</label>
                <input id="detailAddress" type="text" value="${esc(a.address)}"
                       placeholder="123 Main St, Seattle, WA 98104">
            </div>
            <div class="d-url-row">
                <div class="d-field">
                    <label>Website URL</label>
                    <input id="detailWebsiteUrl" type="url" value="${esc(a.websiteUrl)}"
                           placeholder="https://building.com">
                </div>
                <div class="d-field">
                    <label>Listing URL (Zillow, Padmapper…)</label>
                    <input id="detailListingUrl" type="url" value="${esc(a.listingUrl)}"
                           placeholder="https://zillow.com/…">
                </div>
            </div>
        </div>

        <div class="d-section">
            <h3>Units</h3>
            ${unitsTableHtml(a.units)}
        </div>

        <div class="d-section">
            <h3>In-Unit Amenities</h3>
            <div class="inunit-row">
                <label class="amenity-toggle">
                    <input type="checkbox" id="detailAC"${a.ac ? ' checked' : ''}> AC
                </label>
                <label class="amenity-toggle">
                    <input type="checkbox" id="detailDW"${a.dishwasher ? ' checked' : ''}> Dishwasher
                </label>
                <div class="d-field" style="min-width:160px">
                    <label>Washer/Dryer</label>
                    <select id="detailWD">
                        <option value=""        ${!a.washerDryer              ? 'selected' : ''}>Unknown</option>
                        <option value="unit"    ${a.washerDryer === 'unit'    ? 'selected' : ''}>In-unit</option>
                        <option value="building"${a.washerDryer === 'building'? 'selected' : ''}>In building</option>
                        <option value="none"    ${a.washerDryer === 'none'    ? 'selected' : ''}>None</option>
                    </select>
                </div>
            </div>
            <div class="d-field" style="margin-top:6px">
                <label>Utilities included (describe)</label>
                <input id="detailUtilities" type="text" value="${esc(a.utilitiesIncluded || '')}"
                       placeholder="e.g. Water, garbage – $150/mo">
            </div>
        </div>

        <div class="d-section">
            <h3>Building Amenities</h3>
            ${amenityChecklistHtml(a)}
        </div>

        <div class="d-section">
            <h3>Location</h3>
            <div class="d-grid-2">
                <div class="d-field">
                    <label>Walk to work</label>
                    <div class="val" id="detailWalkTime">${esc(realWalkTimes[a.id] || '—')}</div>
                </div>
                <div class="d-field">
                    <label>Nearby grocery stores</label>
                    <div id="groceryResults" class="grocery-results">
                        <div class="grocery-loading">
                            <div class="grocery-spinner"></div>
                            <span>Searching…</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-section">
            <h3>Interactions</h3>
            <div class="d-grid-2">
                <div class="d-field">
                    <label>Phone</label>
                    <input id="detailPhone" type="tel" value="${esc(a.phone)}"
                           placeholder="(206) 555-0100">
                </div>
                <div class="d-field">
                    <label>Contact name</label>
                    <input id="detailContactName" type="text" value="${esc(a.contactName)}"
                           placeholder="Manager name">
                </div>
            </div>
            <div class="inunit-row" style="margin-top:10px">
                <label class="amenity-toggle">
                    <input type="checkbox" id="detailCalled"${a.called ? ' checked' : ''}> Called
                </label>
                <div class="d-field" style="flex:1">
                    <label>Hold period</label>
                    <input id="detailHoldDays" type="text" value="${esc(a.holdDays)}"
                           placeholder="30 days">
                </div>
            </div>
            <div class="d-field" style="margin-top:10px">
                <label>Tour type</label>
                <div class="tour-radio-group">
                    <label><input type="radio" name="tourType" value=""${!a.tourType ? ' checked' : ''}> None</label>
                    <label><input type="radio" name="tourType" value="in-person"${a.tourType === 'in-person' ? ' checked' : ''}> In-person</label>
                    <label><input type="radio" name="tourType" value="virtual"${a.tourType === 'virtual' ? ' checked' : ''}> Virtual</label>
                    <label><input type="radio" name="tourType" value="self-guided"${a.tourType === 'self-guided' ? ' checked' : ''}> Self-guided</label>
                </div>
            </div>
        </div>

        <div class="d-section">
            <h3>Special Offers</h3>
            <div class="d-field">
                <textarea id="detailSpecialOffers"
                          placeholder="e.g. 6 weeks free on 12-month lease, $1,000 gift card">${esc(a.specialOffers)}</textarea>
            </div>
        </div>

        <div class="d-section">
            <h3>Comments</h3>
            <div class="d-field">
                <textarea id="detailComments" style="min-height:90px"
                          placeholder="Shared team comments…">${esc(a.comments)}</textarea>
            </div>
        </div>

        <div class="d-section">
            <h3>Notes</h3>
            <div class="d-field">
                <textarea id="detailNotes"
                          placeholder="Anything else to note…">${esc(a.notes)}</textarea>
            </div>
        </div>

        <div class="d-section">
            <h3>Photos</h3>
            <div class="photo-upload-bar">
                <button type="button" id="uploadPhotosBtn" class="btn-primary btn-sm"
                        onclick="document.getElementById('photoFileInput').click()">📷 Upload photos</button>
                <button type="button" class="btn-outline btn-sm" onclick="addPhotoRow()">+ URL</button>
                <input type="file" id="photoFileInput" accept="image/*" multiple
                       style="display:none" onchange="handlePhotoUpload(this.files)">
            </div>
            <div id="photosContainer">
                ${(a.photos || []).map(p => photoRowHtml(p)).join('')}
            </div>
        </div>

    </div>

    <div class="d-footer">
        <button class="btn-danger" onclick="deleteApt(${a.id})">Delete</button>
        <div class="d-footer-actions">
            <button class="btn-ghost" onclick="closeModal('detailOverlay')">Close</button>
            <button class="btn-save" id="detailSaveBtn" onclick="saveDetail()">Save</button>
        </div>
    </div>`;
}

function collectFormData() {
    const get  = id => document.getElementById(id)?.value?.trim() ?? '';
    const bool = id => document.getElementById(id)?.checked ?? false;

    // Units
    const units = [];
    document.querySelectorAll('#unitsTable .unit-row').forEach(row => {
        const price = parseFloat(row.querySelector('.unit-price')?.value) || null;
        const sqft  = parseFloat(row.querySelector('.unit-sqft')?.value)  || null;
        units.push({
            id:        row.dataset.unitId || `${openDetailId}-${Date.now()}`,
            type:      row.querySelector('.unit-type')?.value?.trim()      || '',
            unitNumber:row.querySelector('.unit-number')?.value?.trim()    || '',
            sqft,
            price,
            available: row.querySelector('.unit-available')?.value?.trim() || 'now',
        });
    });

    // Building amenities
    const buildingAmenities = [...document.querySelectorAll('#amenityChecklist .amenity-cb:checked')]
        .map(cb => cb.value);

    // Tour type
    const tourType = document.querySelector('[name=tourType]:checked')?.value || '';

    // Photos
    const photos = [];
    document.querySelectorAll('#photosContainer .photo-row').forEach(row => {
        const url     = row.querySelector('.photo-url')?.value?.trim() || '';
        const caption = row.querySelector('.photo-caption')?.value?.trim() || '';
        if (url) photos.push({ url, caption });
    });

    return {
        name:             get('detailName'),
        neighborhood:     get('detailNeighborhood'),
        googleRating:     get('detailGoogleRating'),
        address:          get('detailAddress'),
        websiteUrl:       get('detailWebsiteUrl'),
        listingUrl:       get('detailListingUrl'),
        ac:               bool('detailAC'),
        dishwasher:       bool('detailDW'),
        washerDryer:      get('detailWD'),
        utilitiesIncluded:get('detailUtilities'),
        phone:            get('detailPhone'),
        contactName:      get('detailContactName'),
        called:           bool('detailCalled'),
        holdDays:         get('detailHoldDays'),
        tourType,
        specialOffers:    get('detailSpecialOffers'),
        comments:         get('detailComments'),
        notes:            get('detailNotes'),
        buildingAmenities,
        units,
        photos,
    };
}

window.openDetail = function(id) {
    const a = state.apts.find(x => x.id === id);
    if (!a) return;
    openDetailId = id;
    document.getElementById('detailModal').innerHTML = detailModalHtml(a);
    document.getElementById('detailOverlay').classList.remove('hidden');

    // Wire existing photo URL inputs for live preview
    document.querySelectorAll('#photosContainer .photo-row').forEach(row => {
        const urlInput = row.querySelector('input.photo-url:not([type=hidden])');
        const thumb    = row.querySelector('.photo-thumb img');
        if (urlInput && thumb) urlInput.addEventListener('input', () => { thumb.src = urlInput.value; });
    });

    findNearbyGroceries(id);
};

window.saveDetail = async function() {
    const a = state.apts.find(x => x.id === openDetailId);
    if (!a) return;

    const btn = document.getElementById('detailSaveBtn');
    if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

    const data = collectFormData();
    data.id        = a.id;
    data.starred   = a.starred;
    data.sortOrder = a.sortOrder;
    data.photos    = data.photos; // already collected

    Object.assign(a, data);
    await saveApt(a);

    renderList();
    if (btn) { btn.textContent = '✓ Saved'; btn.classList.add('saved'); btn.disabled = false; }
    setTimeout(() => {
        if (btn) { btn.textContent = 'Save'; btn.classList.remove('saved'); }
    }, 2000);

    // Update header links dynamically
    const websiteLink = document.querySelector('#detailModal .d-links a:nth-child(1)');
    const listingLink = document.querySelector('#detailModal .d-links a:nth-child(2)');
    if (websiteLink) { websiteLink.href = a.websiteUrl || '#'; websiteLink.style.opacity = a.websiteUrl ? '' : '0.45'; websiteLink.style.pointerEvents = a.websiteUrl ? '' : 'none'; }
    if (listingLink) { listingLink.href = a.listingUrl || '#'; listingLink.style.opacity = a.listingUrl ? '' : '0.45'; listingLink.style.pointerEvents = a.listingUrl ? '' : 'none'; }
};

window.deleteApt = function(id) {
    if (!confirm('Delete this apartment?')) return;
    state.apts = state.apts.filter(a => a.id !== id);
    deleteAptFromDb(id);
    closeModal('detailOverlay');
    renderList();
};

window.toggleStar = function(id, event) {
    event?.stopPropagation();
    const a = state.apts.find(x => x.id === id);
    if (!a) return;
    a.starred = !a.starred;
    saveApt(a);
    // Update list row in place
    const row = document.querySelector(`.apt-row[data-id="${id}"]`);
    if (row) {
        row.classList.toggle('starred', a.starred);
        const starBtn = row.querySelector('.row-star');
        if (starBtn) starBtn.textContent = a.starred ? '⭐' : '☆';
    }
    // Update detail modal star in place
    const modalStar = document.getElementById('detailStarBtn');
    if (modalStar) modalStar.textContent = a.starred ? '⭐' : '☆';
};

window.addUnitRow = function() {
    const tbody = document.querySelector('#unitsTable tbody');
    if (!tbody) return;
    const uid = `${openDetailId}-${Date.now()}`;
    const tr  = document.createElement('tr');
    tr.className    = 'unit-row';
    tr.dataset.unitId = uid;
    tr.innerHTML = `
        <td><input class="unit-type"      type="text"   placeholder="Studio / 1bd/1ba"></td>
        <td><input class="unit-number"    type="text"   placeholder="4B"></td>
        <td><input class="unit-sqft"      type="number" placeholder="650"></td>
        <td><input class="unit-price"     type="number" placeholder="1650"></td>
        <td><input class="unit-available" type="text"   value="now"></td>
        <td><button type="button" class="unit-del-btn" onclick="deleteUnitRow(this)">×</button></td>`;
    tbody.appendChild(tr);
    tr.querySelector('.unit-type')?.focus();
};

window.deleteUnitRow = function(btn) {
    const tbody = document.querySelector('#unitsTable tbody');
    if (tbody && tbody.rows.length <= 1) { showToast('Need at least one unit'); return; }
    btn.closest('tr').remove();
};

window.addCustomAmenity = function() {
    const val = prompt('Amenity name:')?.trim();
    if (!val) return;
    const list = document.getElementById('amenityChecklist');
    if (!list) return;
    // Check it doesn't already exist
    const exists = [...list.querySelectorAll('.amenity-cb')].some(cb => cb.value.toLowerCase() === val.toLowerCase());
    if (exists) { showToast('Amenity already exists'); return; }
    const label = document.createElement('label');
    label.className = 'amenity-cb-label';
    label.innerHTML = `<input type="checkbox" class="amenity-cb" value="${esc(val)}" checked> ${esc(val)}`;
    list.appendChild(label);
};

// ── URL auto-fill ──────────────────────────────────────────────────────────
window.autoFill = async function(id) {
    const btn = document.getElementById('autoFillBtn');
    const listingUrl = document.getElementById('detailListingUrl')?.value?.trim()
                    || document.getElementById('detailWebsiteUrl')?.value?.trim();
    if (!listingUrl) { showToast('Enter a website or listing URL first'); return; }

    if (btn) { btn.textContent = '⏳ Fetching…'; btn.disabled = true; }

    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(listingUrl)}`;
        const res  = await fetch(proxyUrl);
        const json = await res.json();
        if (!json.contents) throw new Error('No content');
        parseScrapedHtml(json.contents, id);
    } catch (err) {
        console.warn('Auto-fill failed:', err);
        showToast('Auto-fill failed — site may block scraping');
    }

    if (btn) { btn.textContent = '✨ Auto-fill'; btn.disabled = false; }
};

function parseScrapedHtml(html, id) {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, 'text/html');
    const text   = doc.body?.innerText || '';
    const filled = [];

    // Phone — only fill if empty
    const phoneInput = document.getElementById('detailPhone');
    if (phoneInput && !phoneInput.value.trim()) {
        const phoneMatch = text.match(/\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/);
        if (phoneMatch) { phoneInput.value = phoneMatch[0]; filled.push('phone'); }
    }

    // Price — only fill if first unit price is empty
    const firstPriceInput = document.querySelector('#unitsTable .unit-price');
    if (firstPriceInput && !firstPriceInput.value) {
        const prices = [...text.matchAll(/\$[\s]?([\d,]+)/g)]
            .map(m => parseInt(m[1].replace(/,/g,'')))
            .filter(p => p >= 500 && p <= 10000);
        if (prices.length) { firstPriceInput.value = prices[0]; filled.push('price'); }
    }

    // Sqft — only fill if first unit sqft is empty
    const firstSqftInput = document.querySelector('#unitsTable .unit-sqft');
    if (firstSqftInput && !firstSqftInput.value) {
        const sqftMatch = text.match(/(\d{3,4})\s*sq\.?\s*ft/i);
        if (sqftMatch) { firstSqftInput.value = sqftMatch[1]; filled.push('sqft'); }
    }

    // Amenities — only check, never uncheck
    const amenityCheckboxes = document.querySelectorAll('#amenityChecklist .amenity-cb');
    amenityCheckboxes.forEach(cb => {
        if (!cb.checked && text.toLowerCase().includes(cb.value.toLowerCase())) {
            cb.checked = true;
            filled.push(cb.value);
        }
    });

    if (filled.length) {
        showToast(`Auto-filled: ${filled.join(', ')}`);
    } else {
        showToast('Nothing new found to fill in');
    }
}

// ── Modal helpers ──────────────────────────────────────────────────────────
window.closeModal = function(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'detailOverlay') openDetailId = null;
};

document.getElementById('detailOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('detailOverlay');
});

// ── Add apartment ──────────────────────────────────────────────────────────
async function addApt() {
    const apt = createBlankApt();
    state.apts.push(apt);
    await saveApt(apt);
    renderList();
    openDetail(apt.id);
}

// ── Work address ───────────────────────────────────────────────────────────
const workInput = document.getElementById('workInput');
const clearWork = document.getElementById('clearWork');

workInput.value = state.work;
clearWork.classList.toggle('hidden', !state.work);

let workDebounce = null;
workInput.addEventListener('input', () => {
    state.work = workInput.value;
    clearWork.classList.toggle('hidden', !state.work);
    savePrefs();
    renderList();
    clearTimeout(workDebounce);
    workDebounce = setTimeout(() => computeWalkTimes(), 1000);
});

clearWork.addEventListener('click', () => {
    state.work = '';
    workInput.value = '';
    clearWork.classList.add('hidden');
    savePrefs();
    renderList();
});

// ── Filter wiring ──────────────────────────────────────────────────────────
['fType','fRent','fWD'].forEach(id => document.getElementById(id).addEventListener('change', renderList));
['fAC','fDW','fStar'].forEach(id => document.getElementById(id).addEventListener('change', renderList));

// ── Sort button wiring ─────────────────────────────────────────────────────
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => setSortMode(btn.dataset.sort));
});

// ── Add button ─────────────────────────────────────────────────────────────
document.getElementById('addBtn').addEventListener('click', addApt);

// ── Init ───────────────────────────────────────────────────────────────────
loadApts();
