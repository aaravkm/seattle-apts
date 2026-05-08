'use strict';

// ── Supabase ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://frxrbrvfnkopnaebclkb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHJicnZmbmtvcG5hZWJjbGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkyNzgsImV4cCI6MjA5Mzg0NTI3OH0.BJBeYfja8yAocjaZIJCdSguNe0r4GCPofJhi9TFTOTo';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Default data ───────────────────────────────────────────────────────────────
const SEED = [
  {
    id:1, url:'https://www.realtor.com/rentals/details/1000-8th-Ave_Seattle_WA_98104_M20997-64190',
    name:'1000 8th Ave', address:'1000 8th Ave, Seattle, WA 98104',
    type:'1bd/1ba', neighborhood:'First Hill', sqft:550, sqftNote:'500–590',
    rent:1250, rentMax:null, estUtils:1500, utilitiesIncluded:'',
    washerDryer:'building', dishwasher:false, ac:false, heating:false,
    amenities:'Fitness center, pool, theater',
    walkToWork:'12 min', transitToWork:'8 min by bus',
    nearbyTransit:'Metro Route 12 (8th Ave)', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'12', rating:6,
    greenFlags:'', redFlags:'Possible 3D renderings in photos, carpet floors, questionable natural light',
    notes:'', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Details from listing sheet — Realtor.com not accessible for verification',
    commentIshita:"Some images look like 3D renderings, they say a lot of natural light but that's not the vibe, don't love carpet floors",
    commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Ishita', starred:false,
  },
  {
    id:2, url:'https://www.trulia.com/building/devonshire-420-wall-st-seattle-wa-98121-1001470869',
    name:'Devonshire', address:'420 Wall St, Seattle, WA 98121',
    type:'studio', neighborhood:'Belltown', sqft:420, sqftNote:'',
    rent:1375, rentMax:1650, estUtils:null,
    utilitiesIncluded:'Electricity, Garbage, Heat, Sewer, Water',
    washerDryer:'none', dishwasher:false, ac:false, heating:true,
    amenities:'',
    walkToWork:'20 min', transitToWork:'12 min by bus',
    nearbyTransit:'Metro Routes 2/13 (Belltown → downtown)', nearbyGrocery:'10 min walk to Whole Foods',
    dateAvailable:'May 1', leaseMonths:'12', rating:5,
    greenFlags:'Electricity, garbage, heat, sewer, water all included in rent',
    redFlags:'Old building. No W/D in unit or building. AC unclear — contact manager',
    notes:'', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Utilities (Electricity, Garbage, Heat, Sewer, Water) confirmed from Trulia listing. Rent unverified.',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Ishita', starred:false,
  },
  {
    id:3, url:'https://www.apartmentlist.com/shortlist/p37448256',
    name:'Yesler Terrace', address:'120 8th Ave S, Seattle, WA 98104',
    type:'1bd/1ba', neighborhood:'Yesler Terrace', sqft:606, sqftNote:'',
    rent:1467, rentMax:null, estUtils:1667, utilitiesIncluded:'',
    washerDryer:'unit', dishwasher:true, ac:true, heating:true,
    amenities:'Rooftop lounge, hot tub, fitness center, dog park',
    walkToWork:'24 min', transitToWork:'10 min by bus',
    nearbyTransit:'Metro Routes 3/4 (Yesler Way)', nearbyGrocery:'',
    dateAvailable:'May 7', leaseMonths:'12', rating:null,
    greenFlags:'In-unit W/D, dishwasher, AC, rooftop lounge, hot tub, fitness, dog park — verified on website',
    redFlags:'',
    notes:'',
    photos:[{url:'https://cdn.apartmentlist.com/image/upload/c_fill,dpr_auto,f_auto,g_center,h_415,q_auto,w_640/89d38158cf772fcd1a34674513c67ede.jpg', caption:'Building exterior'}],
    rentVerified:true, amenitiesVerified:true,
    dataNote:'Price ($1,467/mo) and amenities verified from ApartmentList. Sheet listed $1,600.',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'', starred:false,
  },
  {
    id:4, url:'https://www.masonandmainapartments.com/floorplans',
    name:'Mason & Main (check plans)', address:'209 12th Avenue South, Seattle, WA 98144',
    type:'1bd/1ba', neighborhood:'First Hill / 12th Ave', sqft:null, sqftNote:'',
    rent:null, rentMax:null, estUtils:null, utilitiesIncluded:'',
    washerDryer:null, dishwasher:null, ac:null, heating:null, amenities:'',
    walkToWork:'18 min', transitToWork:'12 min by bus',
    nearbyTransit:'Metro Routes 3/4 (12th Ave)', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'', redFlags:'',
    notes:'Needs more info — check floor plans link', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Incomplete listing — check floor plans page for current pricing',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Ishita', starred:false,
  },
  {
    id:5, url:'https://www.barclaybroadway.com/',
    name:'Barclay Broadway', address:'Broadway, First Hill, Seattle, WA',
    type:'1bd/1ba', neighborhood:'Broadway / First Hill', sqft:null, sqftNote:'',
    rent:null, rentMax:null, estUtils:null, utilitiesIncluded:'',
    washerDryer:null, dishwasher:null, ac:null, heating:null, amenities:'',
    walkToWork:'20 min', transitToWork:'10 min by bus',
    nearbyTransit:'Capitol Hill Link Station (~5 min walk)', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'', redFlags:'',
    notes:'Needs more info', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Website not accessible — all details from sheet',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Ishita', starred:false,
  },
  {
    id:6, url:'https://www.iconseattle.com/floorplans',
    name:'ICON Seattle', address:'ICON Seattle, Seattle, WA',
    type:'1bd/1ba', neighborhood:'Seattle', sqft:null, sqftNote:'',
    rent:null, rentMax:null, estUtils:null, utilitiesIncluded:'',
    washerDryer:null, dishwasher:null, ac:null, heating:null, amenities:'',
    walkToWork:'', transitToWork:'',
    nearbyTransit:'', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'', redFlags:'',
    notes:'Needs more info', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Website not accessible — all details from sheet',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Ishita', starred:false,
  },
  {
    id:7, url:'https://thewilderseattle.com/floorplans/',
    name:'The Wilder', address:'1607 14th Ave, Seattle, WA 98122',
    type:'1bd/1ba', neighborhood:'Capitol Hill', sqft:null, sqftNote:'',
    rent:null, rentMax:null, estUtils:null, utilitiesIncluded:'',
    washerDryer:null, dishwasher:null, ac:null, heating:null, amenities:'',
    walkToWork:'20 min', transitToWork:'12 min (Capitol Hill Link + walk)',
    nearbyTransit:'Capitol Hill Link Station (~8 min walk)', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'', redFlags:'',
    notes:'Needs more info', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Website not accessible — all details from sheet',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Ishita', starred:false,
  },
  {
    id:8, url:'https://www.terravitaseattle.com/',
    name:'Terravita', address:'1615 Belmont Ave, Seattle, WA 98122',
    type:'studio', neighborhood:'Capitol Hill', sqft:451, sqftNote:'',
    rent:1899, rentMax:null, estUtils:2099, utilitiesIncluded:'',
    washerDryer:'unit', dishwasher:true, ac:null, heating:null, amenities:'',
    walkToWork:'22 min', transitToWork:'12 min (Capitol Hill Link + walk)',
    nearbyTransit:'Capitol Hill Link Station (~6 min walk)', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'In-unit W/D, Capitol Hill Link nearby',
    redFlags:'Sheet listed $1,599 but website shows $1,899+',
    notes:'', photos:[],
    rentVerified:true, amenitiesVerified:false,
    dataNote:'⚠️ Price discrepancy: sheet listed $1,599 — website shows $1,899 for studio. Address and rent verified from website.',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Aarav', starred:false,
  },
  {
    id:9, url:'https://www.zillow.com/apartments/seattle-wa/station-house/Ch2fck/',
    name:'Station House', address:'Capitol Hill, Seattle, WA',
    type:'1bd/1ba', neighborhood:'Capitol Hill', sqft:618, sqftNote:'',
    rent:1650, rentMax:null, estUtils:1850, utilitiesIncluded:'',
    washerDryer:'building', dishwasher:true, ac:true, heating:true,
    amenities:'Patio',
    walkToWork:'22 min', transitToWork:'12 min (Capitol Hill Link)',
    nearbyTransit:'Capitol Hill Link Station', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'New building, very clean, patio',
    redFlags:'',
    notes:'', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Zillow listing not accessible — all details from sheet',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'',
    commentAarav:'Actually very clean and nice, new building, patio', addedBy:'Aarav', starred:false,
  },
  {
    id:10, url:'https://www.livezigseattle.com/',
    name:'Zig Seattle', address:'Cherry Hill, Seattle, WA',
    type:'studio', neighborhood:'Cherry Hill', sqft:449, sqftNote:'',
    rent:1767, rentMax:null, estUtils:1967, utilitiesIncluded:'',
    washerDryer:'unit', dishwasher:true, ac:true, heating:true, amenities:'',
    walkToWork:'28 min', transitToWork:'10 min by bus',
    nearbyTransit:'Metro Routes 3/4 (Cherry Hill)', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'Trendy building, cool studio setup, close to transit',
    redFlags:'',
    notes:'', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Website not accessible — all details from sheet',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'',
    commentAarav:'Trendy building and cool setup for a studio. Yes, very close to transit', addedBy:'Aarav', starred:false,
  },
  {
    id:11, url:'https://www.masonandmainapartments.com/',
    name:'Mason & Main (1B)', address:'209 12th Ave S, Seattle, WA 98144',
    type:'1bd/1ba', neighborhood:'12th Ave S / First Hill', sqft:606, sqftNote:'',
    rent:1520, rentMax:null, estUtils:1720, utilitiesIncluded:'',
    washerDryer:'unit', dishwasher:true, ac:true, heating:true, amenities:'',
    walkToWork:'18 min', transitToWork:'12 min by bus',
    nearbyTransit:'Metro Routes 3/4 (12th Ave)', nearbyGrocery:'Close to many Asian restaurants',
    dateAvailable:'', leaseMonths:'12', rating:10,
    greenFlags:'Awesome building, 18 min to work, tons of great restaurants nearby',
    redFlags:'',
    notes:'Look at the 3D tour!', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Website not fully accessible — details from sheet',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'',
    commentAarav:"This building is awesome, idk just look. 18 min to work. Super close to a bunch of Asian restaurants — so many dates",
    addedBy:'Aarav', starred:true,
  },
  {
    id:12, url:'https://arrivefirsthill.prospectportal.com/seattle/arrive-first-hill/conventional/',
    name:'Arrive First Hill', address:'First Hill, Seattle, WA',
    type:'1bd/1ba', neighborhood:'First Hill', sqft:650, sqftNote:'',
    rent:1754, rentMax:null, estUtils:1954, utilitiesIncluded:'',
    washerDryer:'unit', dishwasher:true, ac:true, heating:true, amenities:'',
    walkToWork:'18 min', transitToWork:'8 min by bus',
    nearbyTransit:'Metro Routes 2/12 (First Hill)', nearbyGrocery:'',
    dateAvailable:'', leaseMonths:'', rating:null,
    greenFlags:'Close to work, in-unit W/D, AC, dishwasher',
    redFlags:'',
    notes:'', photos:[],
    rentVerified:false, amenitiesVerified:false,
    dataNote:'Website not accessible — all details from sheet',
    commentIshita:'', commentIshmeet:'', commentJyotsna:'', commentAarav:'', addedBy:'Aarav', starred:false,
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
const PREFS_KEY = 'seattle-apts-prefs';
let state = {
    apts: [],
    work: '1201 2nd Ave Suite 1900, Seattle, WA 98101',
    compareIds: [],
    nextId: 1,
};

// User-specific prefs (work address, compare selections) stay local
try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
    if (prefs.work !== undefined) state.work = prefs.work;
    if (prefs.compareIds)         state.compareIds = prefs.compareIds;
} catch {}

const save = () => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ work: state.work, compareIds: state.compareIds })); } catch {}
};

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
    if (!data || data.length === 0) {
        // First run — seed the table with default data
        const rows = SEED.map(a => ({ id: a.id, apt: { ...a } }));
        const { error: seedErr } = await sb.from('apartments').insert(rows);
        if (seedErr) { console.error('Seed failed:', seedErr); return; }
        state.apts = SEED.map(a => ({ ...a }));
    } else {
        state.apts = data.map(r => r.apt);
    }
    state.apts.forEach(a => {
        if (!a.photos)                           a.photos             = [];
        if (a.rentVerified    === undefined)      a.rentVerified       = false;
        if (a.amenitiesVerified === undefined)    a.amenitiesVerified  = false;
        if (a.dataNote        === undefined)      a.dataNote           = '';
    });
    state.nextId = Math.max(...state.apts.map(a => a.id)) + 1;
    renderGrid();
}

// Real-time: refresh grid when any apartment changes
sb.channel('apartments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'apartments' }, loadApts)
    .subscribe();

// ── Gallery state ─────────────────────────────────────────────────────────────
let galleryAptId = null;
let galleryIdx   = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const or  = (v, fallback='—') => (v != null && v !== '') ? v : fallback;

function rentClass(r) {
    if (r == null) return 'unknown';
    if (r < 1500)  return 'cheap';
    if (r <= 1700) return 'mid';
    return 'pricey';
}

function starsHtml(r) {
    if (r == null) return '<span class="no-info">Not rated</span>';
    const n = Math.min(10, Math.round(r));
    return '★'.repeat(n) + '☆'.repeat(10 - n);
}

function mapsUrl(from, to, mode) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${mode}`;
}

function groceryMapsUrl(address) {
    return `https://www.google.com/maps/search/grocery+stores+near+${encodeURIComponent(address)}`;
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

function wdLabel(v) {
    if (v === 'unit')     return '<span class="badge badge-green">W/D in-unit</span>';
    if (v === 'building') return '<span class="badge badge-blue">W/D in building</span>';
    if (v === 'none')     return '<span class="badge badge-gray">No W/D</span>';
    return '<span class="no-info">W/D unknown</span>';
}

function yesNo(v, label) {
    if (v === true)  return `<span class="badge badge-green">${label}</span>`;
    if (v === false) return `<span class="badge badge-gray">No ${label}</span>`;
    return `<span class="no-info">${label}?</span>`;
}

function srcBadge(verified) {
    return verified
        ? '<span class="badge badge-verified">✓ verified</span>'
        : '<span class="badge badge-sheet">from sheet</span>';
}

// ── Image compression ─────────────────────────────────────────────────────────
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

// ── Grocery lookup ────────────────────────────────────────────────────────────
async function findNearbyGroceries(aptId) {
    const a  = state.apts.find(x => x.id === aptId);
    const el = document.getElementById('groceryResults');
    if (!a || !a.address || !el) return;

    const mapsBtn = `<a class="link-btn grocery-maps-btn" href="${groceryMapsUrl(a.address)}" target="_blank">🗺 View all on Google Maps</a>`;

    try {
        const geoRes  = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(a.address)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'SeattleAptFinder/1.0' } }
        );
        const geoData = await geoRes.json();
        if (!geoData.length) {
            el.innerHTML = `<p class="no-info" style="margin-bottom:8px">Could not locate address.</p>${mapsBtn}`;
            return;
        }

        const { lat, lon } = geoData[0];
        const q = `[out:json][timeout:12];(node["shop"~"supermarket|grocery"](around:1000,${lat},${lon});way["shop"~"supermarket|grocery"](around:1000,${lat},${lon});node["shop"="convenience"](around:600,${lat},${lon}););out center;`;

        const opRes  = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: 'data=' + encodeURIComponent(q),
        });
        const opData = await opRes.json();

        const stores = opData.elements
            .map(el => {
                const eLat = el.lat ?? el.center?.lat;
                const eLon = el.lon ?? el.center?.lon;
                if (!eLat || !eLon || !el.tags?.name) return null;
                return { name: el.tags.name, type: el.tags.shop, dist: haversine(+lat, +lon, eLat, eLon) };
            })
            .filter(Boolean)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 6);

        if (!stores.length) {
            el.innerHTML = `<p class="no-info" style="margin-bottom:8px">No stores found within 0.6 miles.</p>${mapsBtn}`;
            return;
        }

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
        el.innerHTML = `<p class="no-info" style="margin-bottom:8px">Could not load store data.</p>${mapsBtn}`;
    }
}

// ── Filter / sort ─────────────────────────────────────────────────────────────
function getVisible() {
    const fType = document.getElementById('fType').value;
    const fRent = +document.getElementById('fRent').value || Infinity;
    const fWD   = document.getElementById('fWD').value;
    const fAC   = document.getElementById('fAC').checked;
    const fDW   = document.getElementById('fDW').checked;
    const fStar = document.getElementById('fStar').checked;
    const sort  = document.getElementById('sortBy').value;

    let list = state.apts.filter(a => {
        if (fType && a.type !== fType) return false;
        if (fRent < Infinity && (a.rent == null || a.rent > fRent)) return false;
        if (fWD && a.washerDryer !== fWD) return false;
        if (fAC  && !a.ac)        return false;
        if (fDW  && !a.dishwasher) return false;
        if (fStar && !a.starred)   return false;
        return true;
    });

    list.sort((a, b) => {
        if (sort === 'rent')      return (a.rent ?? 9999) - (b.rent ?? 9999);
        if (sort === 'rentDesc')  return (b.rent ?? 0) - (a.rent ?? 0);
        if (sort === 'sqft')      return (a.sqft ?? 9999) - (b.sqft ?? 9999);
        if (sort === 'rating')    return (b.rating ?? -1) - (a.rating ?? -1);
        if (sort === 'available') return String(a.dateAvailable).localeCompare(String(b.dateAvailable));
        return 0;
    });

    return list;
}

// ── Card ──────────────────────────────────────────────────────────────────────
function cardHtml(a) {
    const work    = state.work;
    const hasWork = work.trim() !== '';

    const distBadge = (() => {
        const walk    = a.walkToWork?.trim();
        const transit = a.transitToWork?.trim();
        if (!walk && !transit) return hasWork ? `<a href="${mapsUrl(a.address, work, 'walking')}" target="_blank" class="work-dist" onclick="event.stopPropagation()">🗺 Get directions</a>` : '';
        const parts = [];
        if (walk)    parts.push(`🚶 ${walk}`);
        if (transit) parts.push(`🚌 ${transit}`);
        return `<span class="work-dist">${parts.join(' · ')}</span>`;
    })();

    const inCompare = state.compareIds.includes(a.id);
    const thumb     = a.photos?.length > 0 ? a.photos[0].url : null;

    return `
    <div class="card ${a.starred ? 'starred' : ''}" data-id="${a.id}">
        ${thumb ? `<div class="card-photo"><img src="${esc(thumb)}" alt="${esc(a.name)}" loading="lazy" onerror="this.closest('.card-photo').remove()"></div>` : ''}
        <div class="card-top">
            <div class="card-title">
                <span class="apt-name">${esc(a.name)}</span>
                <span class="apt-hood">${esc(a.neighborhood)} · ${esc(a.type)}</span>
            </div>
            <div class="card-top-actions">
                <button class="star-btn" title="${a.starred ? 'Unstar' : 'Star'}" onclick="toggleStar(${a.id},event)">${a.starred ? '⭐' : '☆'}</button>
                <input type="checkbox" class="cmp-check" title="Add to compare" ${inCompare ? 'checked' : ''} onclick="toggleCompare(${a.id},event)">
            </div>
        </div>

        <div class="card-meta">${a.sqft ? `${a.sqftNote || a.sqft} sqft` : '<span class="no-info">Sqft unknown</span>'}</div>

        <div class="card-rent">
            <span class="rent-num ${rentClass(a.rent)}">${a.rent ? '$' + a.rent.toLocaleString() : '—'}</span>
            <span class="rent-sub">/mo${a.rentMax ? '–$'+a.rentMax.toLocaleString() : ''}${a.estUtils ? ' · est. $'+a.estUtils.toLocaleString()+' w/ utils' : ''}</span>
        </div>

        <div class="badges">
            ${wdLabel(a.washerDryer)}
            ${a.dishwasher ? '<span class="badge badge-green">Dishwasher</span>' : ''}
            ${a.ac         ? '<span class="badge badge-blue">AC</span>'  : ''}
            ${a.heating    ? '<span class="badge badge-yellow">Heating</span>' : ''}
            ${a.utilitiesIncluded ? '<span class="badge badge-orange">Utils included</span>' : ''}
        </div>

        <div class="card-info">
            ${a.dateAvailable ? `<div class="info-row"><span class="ii">📅</span><span>Available ${esc(a.dateAvailable)}</span></div>` : ''}
            ${a.amenities    ? `<div class="info-row"><span class="ii">🏢</span><span>${esc(a.amenities)}</span></div>` : ''}
            <div class="info-row">
                <span class="ii">🛒</span>
                ${a.nearbyGrocery
                    ? `<span>${esc(a.nearbyGrocery)}</span>`
                    : `<a class="grocery-card-link" href="${groceryMapsUrl(a.address)}" target="_blank" onclick="event.stopPropagation()">Find grocery stores</a>`}
            </div>
        </div>

        <div class="card-rating">
            <span class="stars">${starsHtml(a.rating)}</span>
            ${a.rating != null ? `<span class="rating-num">${a.rating}/10</span>` : ''}
        </div>

        <div class="card-footer">
            <span>${distBadge}</span>
            <span class="added-by">${a.addedBy ? 'by ' + esc(a.addedBy) : ''}</span>
        </div>
    </div>`;
}

// ── Grid render ───────────────────────────────────────────────────────────────
function renderGrid() {
    const list  = getVisible();
    const grid  = document.getElementById('grid');
    const empty = document.getElementById('empty');
    const count = document.getElementById('aptCount');

    count.textContent = `${state.apts.length} apartments · ${list.length} shown`;

    if (list.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        grid.innerHTML = list.map(cardHtml).join('');
        grid.querySelectorAll('.card').forEach(el => {
            el.addEventListener('click', () => openDetail(+el.dataset.id));
        });
    }

    const n   = state.compareIds.length;
    const btn = document.getElementById('compareBtn');
    document.getElementById('compareCount').textContent = n;
    btn.disabled = n < 2;
    btn.classList.toggle('active', n > 0);
}

// ── Star / compare toggles ────────────────────────────────────────────────────
window.toggleStar = function(id, e) {
    e.stopPropagation();
    const a = state.apts.find(x => x.id === id);
    if (a) { a.starred = !a.starred; saveApt(a); renderGrid(); }
};

window.toggleCompare = function(id, e) {
    e.stopPropagation();
    const idx = state.compareIds.indexOf(id);
    if (idx >= 0) {
        state.compareIds.splice(idx, 1);
    } else {
        if (state.compareIds.length >= 3) {
            alert('You can compare up to 3 apartments at a time.');
            e.target.checked = false;
            return;
        }
        state.compareIds.push(id);
    }
    save();
    renderGrid();
};

// ── Gallery helpers ───────────────────────────────────────────────────────────
window.galleryNav = function(dir) {
    const a = state.apts.find(x => x.id === galleryAptId);
    if (!a || !a.photos.length) return;
    galleryIdx = (galleryIdx + dir + a.photos.length) % a.photos.length;
    updateGalleryUI(a);
};

window.gallerySet = function(idx) {
    const a = state.apts.find(x => x.id === galleryAptId);
    if (!a) return;
    galleryIdx = idx;
    updateGalleryUI(a);
};

function updateGalleryUI(a) {
    const img  = document.getElementById('galleryImg');
    const curr = document.getElementById('galleryCurr');
    if (img)  img.src = a.photos[galleryIdx].url;
    if (curr) curr.textContent = galleryIdx + 1;
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === galleryIdx));
}

function galleryHtml(a) {
    if (!a.photos?.length) return '';
    const multi = a.photos.length > 1;
    return `
    <div class="gallery">
        <div class="gallery-main">
            <img id="galleryImg" src="${esc(a.photos[0].url)}" alt="${esc(a.photos[0].caption || a.name)}" onerror="this.closest('.gallery').remove()">
            ${multi ? `
            <button class="gallery-btn gallery-prev" onclick="galleryNav(-1)">&#8249;</button>
            <button class="gallery-btn gallery-next" onclick="galleryNav(1)">&#8250;</button>
            <div class="gallery-counter"><span id="galleryCurr">1</span>/${a.photos.length}</div>
            ` : ''}
        </div>
        ${multi ? `
        <div class="gallery-thumbs">
            ${a.photos.map((p, i) => `<img class="gallery-thumb ${i===0?'active':''}" src="${esc(p.url)}" onclick="gallerySet(${i})" title="${esc(p.caption||'')}">`).join('')}
        </div>` : ''}
    </div>`;
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function openDetail(id) {
    const a = state.apts.find(x => x.id === id);
    if (!a) return;
    galleryAptId = id;
    galleryIdx   = 0;
    const work = state.work.trim();

    const walkLink    = work && a.address ? `<a class="link-btn" href="${mapsUrl(a.address, work, 'walking')}" target="_blank">🚶 Walk to work</a>` : '';
    const transitLink = work && a.address ? `<a class="link-btn" href="${mapsUrl(a.address, work, 'transit')}" target="_blank">🚌 Transit to work</a>` : '';

    const hasWarn = a.dataNote?.includes('⚠️');
    const noteClass = (a.rentVerified && a.amenitiesVerified) ? 'data-note verified' : hasWarn ? 'data-note warn' : 'data-note';

    document.getElementById('detailModal').innerHTML = `
        <button class="modal-close" onclick="closeModal('detailOverlay')">×</button>

        ${galleryHtml(a)}

        <div class="d-header">
            <div class="d-name">${esc(a.name)} ${a.starred ? '⭐' : ''}</div>
            <div class="d-sub">${esc(a.neighborhood)} · ${esc(a.type)}${a.sqft ? ' · ' + (a.sqftNote || a.sqft) + ' sqft' : ''}</div>
            <div class="d-links">
                ${a.url ? `<a class="link-btn" href="${esc(a.url)}" target="_blank">🔗 View listing</a>` : ''}
                ${walkLink}${transitLink}
                <button class="link-btn" onclick="openForm(${a.id})">✏️ Edit</button>
            </div>
        </div>

        <div class="d-body">

            ${a.dataNote ? `<div class="${noteClass}">${esc(a.dataNote)}</div>` : ''}

            <div class="d-section">
                <h3>Rent</h3>
                <div class="d-grid-3">
                    <div class="d-field">
                        <label>Base rent ${srcBadge(a.rentVerified)}</label>
                        <div class="val"><span class="rent-num ${rentClass(a.rent)}">${a.rent ? '$'+a.rent.toLocaleString() : '—'}</span>${a.rentMax ? '–$'+a.rentMax.toLocaleString() : ''}</div>
                    </div>
                    <div class="d-field"><label>Est. with utilities</label><div class="val">${a.estUtils ? '$'+a.estUtils.toLocaleString()+'/mo' : '<span class="no-info">Unknown</span>'}</div></div>
                    <div class="d-field"><label>Utilities included</label><div class="val">${a.utilitiesIncluded || '<span class="no-info">None / unknown</span>'}</div></div>
                </div>
            </div>

            <div class="d-section">
                <h3>Unit & Building ${srcBadge(a.amenitiesVerified)}</h3>
                <div class="badges" style="margin-bottom:10px">
                    ${wdLabel(a.washerDryer)}
                    ${yesNo(a.dishwasher,'Dishwasher')}
                    ${yesNo(a.ac,'AC')}
                    ${yesNo(a.heating,'Heating')}
                </div>
                ${a.amenities ? `<div class="d-field"><label>Building amenities</label><div class="val">${esc(a.amenities)}</div></div>` : ''}
            </div>

            <div class="d-section">
                <h3>Availability</h3>
                <div class="d-grid-3">
                    <div class="d-field"><label>Available</label><div class="val">${or(a.dateAvailable)}</div></div>
                    <div class="d-field"><label>Lease length</label><div class="val">${a.leaseMonths ? a.leaseMonths + ' months' : '—'}</div></div>
                    <div class="d-field"><label>Added by</label><div class="val">${or(a.addedBy)}</div></div>
                </div>
            </div>

            <div class="d-section">
                <h3>Distance & Location</h3>
                <div class="d-grid-2">
                    <div class="d-field"><label>Walk to work</label><div class="val">${or(a.walkToWork)}</div></div>
                    <div class="d-field"><label>Transit to work</label><div class="val">${or(a.transitToWork)}</div></div>
                    <div class="d-field"><label>Nearby transit</label><div class="val">${or(a.nearbyTransit)}</div></div>
                    <div class="d-field"><label>Noted grocery</label><div class="val">${or(a.nearbyGrocery)}</div></div>
                </div>
            </div>

            <div class="d-section">
                <h3>Nearby Grocery Stores</h3>
                <div id="groceryResults" class="grocery-results">
                    <div class="grocery-loading">
                        <div class="grocery-spinner"></div>
                        <span>Searching nearby stores…</span>
                    </div>
                </div>
            </div>

            <div class="d-section">
                <h3>Rating & Flags</h3>
                <div class="d-field" style="margin-bottom:10px">
                    <label>Rating</label>
                    <div class="val">
                        <span class="stars">${starsHtml(a.rating)}</span>
                        ${a.rating != null ? `<span class="rating-num" style="margin-left:6px">${a.rating}/10</span>` : ''}
                    </div>
                </div>
                ${a.greenFlags ? `<div class="flag-box flag-green" style="margin-bottom:8px">✅ ${esc(a.greenFlags)}</div>` : ''}
                ${a.redFlags   ? `<div class="flag-box flag-red">❌ ${esc(a.redFlags)}</div>` : ''}
            </div>

            ${a.notes ? `
            <div class="d-section">
                <h3>Notes</h3>
                <div class="flag-box" style="background:#f8fafc">${esc(a.notes)}</div>
            </div>` : ''}

            <div class="d-section">
                <h3>Comments</h3>
                <div class="comment-block">
                    ${['Ishita','Ishmeet','Jyotsna','Aarav'].map(name => `
                    <div class="comment-row">
                        <div class="comment-name">${name}</div>
                        <textarea class="comment-text" data-id="${a.id}" data-who="${name.toLowerCase()}" placeholder="Add comment…">${esc(a['comment'+name] || '')}</textarea>
                    </div>`).join('')}
                </div>
            </div>

        </div>

        <div class="d-footer">
            <button class="btn-danger" onclick="deleteApt(${a.id})">Delete</button>
            <div class="d-footer-actions">
                <button class="btn-ghost" onclick="closeModal('detailOverlay')">Close</button>
                <button class="btn-save" onclick="saveComments(${a.id})">Save comments</button>
            </div>
        </div>
    `;

    document.getElementById('detailOverlay').classList.remove('hidden');
    findNearbyGroceries(id);
}

window.saveComments = function(id) {
    const a = state.apts.find(x => x.id === id);
    if (!a) return;
    document.querySelectorAll('.comment-text[data-id]').forEach(ta => {
        if (+ta.dataset.id !== id) return;
        const who = ta.dataset.who;
        a['comment' + who.charAt(0).toUpperCase() + who.slice(1)] = ta.value;
    });
    saveApt(a);
    renderGrid();
    const btn = document.querySelector('.btn-save');
    if (btn) { btn.textContent = '✓ Saved'; setTimeout(() => { btn.textContent = 'Save comments'; }, 1500); }
};

window.deleteApt = function(id) {
    if (!confirm('Delete this apartment?')) return;
    state.apts = state.apts.filter(a => a.id !== id);
    state.compareIds = state.compareIds.filter(x => x !== id);
    save();
    deleteAptFromDb(id);
    closeModal('detailOverlay');
    renderGrid();
};

// ── Photo helpers ─────────────────────────────────────────────────────────────
function photoRowHtml(photo) {
    const url     = photo?.url     || '';
    const caption = photo?.caption || '';
    const isData  = url.startsWith('data:');
    return `
    <div class="photo-row">
        <div class="photo-thumb">
            ${url ? `<img src="${esc(url)}" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="photo-fields">
            ${isData
                ? `<div class="photo-uploaded-badge">📷 Uploaded photo</div>
                   <input type="hidden" class="photo-url" value="${esc(url)}">`
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
    if (!photo?.url) row.querySelector('.photo-url')?.focus();
    // Live preview: update thumb when URL input changes
    const urlInput = row.querySelector('input.photo-url');
    const thumbImg = row.querySelector('.photo-thumb img');
    if (urlInput && thumbImg) {
        urlInput.addEventListener('input', () => { thumbImg.src = urlInput.value; thumbImg.style.display = 'block'; });
    }
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
            alert('Photo upload failed — check the console for details.');
        }
    }
    if (uploadBtn) { uploadBtn.textContent = '📷 Upload photos'; uploadBtn.disabled = false; }
    document.getElementById('photoFileInput').value = '';
};

// ── Add / Edit form ───────────────────────────────────────────────────────────
window.openForm = function(id) {
    const existing = id ? state.apts.find(a => a.id === id) : null;
    const a        = existing || { id: null, type:'1bd/1ba', washerDryer:'unit', dishwasher:true, ac:true, heating:true, photos:[] };
    const isEdit   = !!existing;

    const sel = (name, opts, val) =>
        `<select name="${name}">${opts.map(([v,l]) => `<option value="${v}" ${v==val?'selected':''}>${l}</option>`).join('')}</select>`;

    const inp = (name, label, val, type='text', placeholder='') =>
        `<div class="d-field"><label>${label}</label><input type="${type}" name="${name}" value="${esc(val??'')}" placeholder="${esc(placeholder)}"></div>`;

    const ta = (name, label, val, placeholder='') =>
        `<div class="d-field"><label>${label}</label><textarea name="${name}" placeholder="${esc(placeholder)}">${esc(val??'')}</textarea></div>`;

    document.getElementById('formModal').innerHTML = `
        <button class="modal-close" onclick="closeModal('formOverlay')">×</button>
        <div class="form-header"><h2>${isEdit ? 'Edit' : 'Add'} Apartment</h2></div>
        <form id="aptForm" class="form-body">

            <div class="form-section">Basic Info</div>
            <div class="form-row">
                ${inp('name','Name',a.name,'text','e.g. Station House')}
                ${inp('url','Listing URL',a.url,'url','https://...')}
            </div>
            <div class="form-row">
                ${inp('address','Full Address',a.address,'text','123 Main St, Seattle, WA 98104')}
                ${inp('neighborhood','Neighborhood',a.neighborhood,'text','Capitol Hill')}
            </div>
            <div class="form-row-3">
                <div class="d-field"><label>Type</label>${sel('type',[['studio','Studio'],['1bd/1ba','1 bed / 1 bath']],a.type)}</div>
                ${inp('sqft','Sqft',a.sqft,'number','618')}
                ${inp('sqftNote','Sqft note',a.sqftNote,'text','600–640')}
            </div>

            <div class="form-section">Photos</div>
            <div class="photo-upload-bar">
                <button type="button" id="uploadPhotosBtn" class="btn-primary btn-sm" onclick="document.getElementById('photoFileInput').click()">📷 Upload photos</button>
                <button type="button" class="btn-outline btn-sm" onclick="addPhotoRow()">+ Add by URL</button>
                <input type="file" id="photoFileInput" accept="image/*" multiple style="display:none" onchange="handlePhotoUpload(this.files)">
                <span class="photo-hint">Uploads are compressed &amp; stored locally in your browser</span>
            </div>
            <div id="photosContainer">
                ${(a.photos||[]).map(p => photoRowHtml(p)).join('')}
            </div>

            <div class="form-section">Rent</div>
            <div class="form-row-3">
                ${inp('rent','Base rent ($)',a.rent,'number','1650')}
                ${inp('rentMax','Max rent ($)',a.rentMax,'number','')}
                ${inp('estUtils','Est. w/ utilities ($)',a.estUtils,'number','1850')}
            </div>
            ${inp('utilitiesIncluded','Utilities included',a.utilitiesIncluded,'text','Electricity, Water, Heat')}
            <div class="form-row">
                <div class="d-field">
                    <label>Rent verified from website?</label>
                    ${sel('rentVerified',[['true','Yes — verified'],['false','No — from sheet']],a.rentVerified===true?'true':'false')}
                </div>
                ${inp('dataNote','Data source note',a.dataNote,'text','e.g. Price verified May 7')}
            </div>

            <div class="form-section">Unit & Building</div>
            <div class="form-row-3">
                <div class="d-field"><label>Washer/Dryer</label>${sel('washerDryer',[['unit','In-unit'],['building','In building'],['none','None'],['' ,'Unknown']],a.washerDryer)}</div>
                <div class="d-field"><label>Dishwasher</label>${sel('dishwasher',[['true','Yes'],['false','No'],['','Unknown']],a.dishwasher===true?'true':a.dishwasher===false?'false':'')}</div>
                <div class="d-field"><label>AC</label>${sel('ac',[['true','Yes'],['false','No'],['','Unknown']],a.ac===true?'true':a.ac===false?'false':'')}</div>
            </div>
            <div class="form-row">
                <div class="d-field"><label>Heating</label>${sel('heating',[['true','Yes'],['false','No'],['','Unknown']],a.heating===true?'true':a.heating===false?'false':'')}</div>
                ${inp('amenities','Building amenities',a.amenities,'text','Gym, pool, rooftop')}
            </div>
            <div class="d-field">
                <label>Amenities verified from website?</label>
                ${sel('amenitiesVerified',[['true','Yes — verified'],['false','No — from sheet']],a.amenitiesVerified===true?'true':'false')}
            </div>

            <div class="form-section">Availability</div>
            <div class="form-row">
                ${inp('dateAvailable','Date available',a.dateAvailable,'text','May 15')}
                ${inp('leaseMonths','Lease length (months)',a.leaseMonths,'text','12')}
            </div>

            <div class="form-section">Distance & Location</div>
            <div class="form-row">
                ${inp('walkToWork','Walk to work',a.walkToWork,'text','12 min')}
                ${inp('transitToWork','Transit to work',a.transitToWork,'text','8 min by bus')}
            </div>
            <div class="form-row">
                ${inp('nearbyTransit','Nearby transit stop',a.nearbyTransit,'text','Capitol Hill Link Station')}
                ${inp('nearbyGrocery','Nearby grocery (text note)',a.nearbyGrocery,'text','10 min walk to QFC')}
            </div>

            <div class="form-section">Rating & Flags</div>
            <div class="d-field">
                <label>Rating (1–10)</label>
                <div class="rating-input">
                    <input type="range" name="ratingRange" min="0" max="10" step="1" value="${a.rating??0}" oninput="document.getElementById('ratingDisp').textContent=this.value==0?'Not rated':this.value+'/10'">
                    <span class="rating-val" id="ratingDisp">${a.rating ? a.rating+'/10' : 'Not rated'}</span>
                    <input type="hidden" name="rating" value="${a.rating??''}">
                </div>
            </div>
            ${ta('greenFlags','Green flags ✅',a.greenFlags,'What you love about it')}
            ${ta('redFlags','Red flags ❌',a.redFlags,'Concerns or drawbacks')}
            ${ta('notes','Notes',a.notes,'Anything else to note')}

            <div class="form-section">Added By</div>
            ${inp('addedBy','Who added this',a.addedBy,'text','Aarav')}

        </form>
        <div class="form-footer">
            <button class="btn-ghost" onclick="closeModal('formOverlay')">Cancel</button>
            <button class="btn-save" onclick="submitForm(${isEdit ? a.id : 'null'})">Save</button>
        </div>
    `;

    const range  = document.querySelector('[name=ratingRange]');
    const hidden = document.querySelector('[name=rating]');
    if (range) range.addEventListener('input', () => { hidden.value = range.value == 0 ? '' : range.value; });

    // Wire live previews for pre-existing URL rows
    document.querySelectorAll('#photosContainer .photo-row').forEach(row => {
        const urlInput = row.querySelector('input.photo-url:not([type=hidden])');
        const thumbImg = row.querySelector('.photo-thumb img');
        if (urlInput && thumbImg) {
            urlInput.addEventListener('input', () => { thumbImg.src = urlInput.value; });
        }
    });

    document.getElementById('formOverlay').classList.remove('hidden');
    if (isEdit) closeModal('detailOverlay');
};

window.submitForm = function(id) {
    const form = document.getElementById('aptForm');
    const fd   = new FormData(form);
    const get  = k => fd.get(k)?.trim() ?? '';
    const bool = k => fd.get(k) === 'true' ? true : fd.get(k) === 'false' ? false : null;

    const photos = [];
    document.querySelectorAll('#photosContainer .photo-row').forEach(row => {
        const urlInput = row.querySelector('.photo-url');
        const url      = urlInput?.value.trim() || '';
        const caption  = row.querySelector('.photo-caption')?.value.trim() || '';
        if (url) photos.push({ url, caption });
    });

    const data = {
        url: get('url'), name: get('name'), address: get('address'),
        neighborhood: get('neighborhood'), type: get('type'),
        sqft: get('sqft') ? +get('sqft') : null,
        sqftNote: get('sqftNote'),
        rent: get('rent') ? +get('rent') : null,
        rentMax: get('rentMax') ? +get('rentMax') : null,
        estUtils: get('estUtils') ? +get('estUtils') : null,
        utilitiesIncluded: get('utilitiesIncluded'),
        washerDryer: get('washerDryer') || null,
        dishwasher: bool('dishwasher'), ac: bool('ac'), heating: bool('heating'),
        amenities: get('amenities'),
        dateAvailable: get('dateAvailable'), leaseMonths: get('leaseMonths'),
        walkToWork: get('walkToWork'), transitToWork: get('transitToWork'),
        nearbyTransit: get('nearbyTransit'), nearbyGrocery: get('nearbyGrocery'),
        rating: get('rating') !== '' ? +get('rating') : null,
        greenFlags: get('greenFlags'), redFlags: get('redFlags'),
        notes: get('notes'), addedBy: get('addedBy'),
        rentVerified: fd.get('rentVerified') === 'true',
        amenitiesVerified: fd.get('amenitiesVerified') === 'true',
        dataNote: get('dataNote'),
        photos,
    };

    if (id) {
        Object.assign(state.apts.find(x => x.id === id), data);
        data.id = id;
    } else {
        data.id = state.nextId++;
        data.starred = false;
        data.commentIshita = ''; data.commentIshmeet = '';
        data.commentJyotsna = ''; data.commentAarav = '';
        state.apts.push(data);
    }

    saveApt(data);
    closeModal('formOverlay');
    renderGrid();
};

// ── Compare modal ─────────────────────────────────────────────────────────────
function openCompare() {
    const apts = state.apts.filter(a => state.compareIds.includes(a.id));
    if (apts.length < 2) return;

    const minRent   = Math.min(...apts.map(a => a.rent ?? Infinity));
    const maxRent   = Math.max(...apts.map(a => a.rent ?? -Infinity));
    const maxSqft   = Math.max(...apts.map(a => a.sqft ?? -Infinity));
    const maxRating = Math.max(...apts.map(a => a.rating ?? -1));

    const rows = [
        ['Neighborhood',    a => a.neighborhood],
        ['Type',            a => a.type],
        ['Sqft',            a => a.sqft ? (a.sqftNote || a.sqft) + ' sqft' : '—'],
        ['Base rent',       a => a.rent ? '$'+a.rent.toLocaleString() : '—'],
        ['Est. w/ utils',   a => a.estUtils ? '$'+a.estUtils.toLocaleString() : '—'],
        ['Utils included',  a => a.utilitiesIncluded || 'None'],
        ['Washer/Dryer',    a => a.washerDryer === 'unit' ? 'In-unit ✅' : a.washerDryer === 'building' ? 'Building' : a.washerDryer === 'none' ? 'None' : '?'],
        ['Dishwasher',      a => a.dishwasher === true ? 'Yes ✅' : a.dishwasher === false ? 'No' : '?'],
        ['AC',              a => a.ac === true ? 'Yes ✅' : a.ac === false ? 'No' : '?'],
        ['Available',       a => a.dateAvailable || '—'],
        ['Lease',           a => a.leaseMonths ? a.leaseMonths+' mo' : '—'],
        ['Walk to work',    a => a.walkToWork || '—'],
        ['Transit to work', a => a.transitToWork || '—'],
        ['Nearby transit',  a => a.nearbyTransit || '—'],
        ['Rating',          a => a.rating != null ? a.rating+'/10' : '—'],
        ['Green flags',     a => a.greenFlags || '—'],
        ['Red flags',       a => a.redFlags || '—'],
        ['Notes',           a => a.notes || '—'],
        ['Data source',     a => a.rentVerified ? '✓ Rent verified' : 'From sheet'],
    ];

    const tableRows = rows.map(([label, fn]) =>
        `<tr><td>${label}</td>${apts.map(a => `<td>${esc(String(fn(a) ?? '—'))}</td>`).join('')}</tr>`
    );

    document.getElementById('compareModal').innerHTML = `
        <button class="modal-close" onclick="closeModal('compareOverlay')">×</button>
        <div style="padding:20px 24px 0"><h2 style="font-size:1.1rem;font-weight:800">Compare Apartments</h2></div>
        <div class="compare-wrap">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th></th>
                        ${apts.map(a => `<th><div class="compare-apt-name">${esc(a.name)}</div><div class="compare-apt-sub">${esc(a.neighborhood)}</div></th>`).join('')}
                    </tr>
                </thead>
                <tbody>${tableRows.join('')}</tbody>
            </table>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);text-align:right">
            <button class="btn-ghost" onclick="closeModal('compareOverlay')">Close</button>
        </div>
    `;

    document.getElementById('compareOverlay').classList.remove('hidden');

    const highlight = (rowIdx, getBest, getWorst) => {
        const trs = document.querySelectorAll('.compare-table tr');
        if (!trs[rowIdx + 1]) return;
        trs[rowIdx + 1].querySelectorAll('td:not(:first-child)').forEach((c, i) => {
            if (getBest  && getBest(apts[i]))  c.classList.add('cell-best');
            if (getWorst && getWorst(apts[i])) c.classList.add('cell-worst');
        });
    };

    highlight(3,  a => a.rent === minRent, a => a.rent === maxRent);
    highlight(2,  a => a.sqft === maxSqft, null);
    highlight(14, a => a.rating === maxRating, null);
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
window.closeModal = id => document.getElementById(id).classList.add('hidden');

['detailOverlay','compareOverlay','formOverlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal(id);
    });
});

// ── Work location ─────────────────────────────────────────────────────────────
const workInput = document.getElementById('workInput');
const clearWork = document.getElementById('clearWork');

workInput.value = state.work;
clearWork.classList.toggle('hidden', !state.work);

workInput.addEventListener('input', () => {
    state.work = workInput.value;
    clearWork.classList.toggle('hidden', !state.work);
    save();
    renderGrid();
});

clearWork.addEventListener('click', () => {
    state.work = '';
    workInput.value = '';
    clearWork.classList.add('hidden');
    save();
    renderGrid();
});

// ── Filter / sort listeners ───────────────────────────────────────────────────
['fType','fRent','fWD','sortBy'].forEach(id => document.getElementById(id).addEventListener('change', renderGrid));
['fAC','fDW','fStar'].forEach(id => document.getElementById(id).addEventListener('change', renderGrid));

// ── Header buttons ────────────────────────────────────────────────────────────
document.getElementById('addBtn').addEventListener('click', () => openForm(null));
document.getElementById('compareBtn').addEventListener('click', openCompare);

// ── Init ──────────────────────────────────────────────────────────────────────
loadApts();
