const defaultCity = 'New Delhi';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const favoritesListEl = document.getElementById('favoritesList');
const recentListEl = document.getElementById('recentList');
const forecastContainer = document.querySelector('.forecast-container');
const forecastToggleBtn = document.createElement('button');
forecastToggleBtn.id = 'forecastToggle';
forecastToggleBtn.className = 'pill-btn secondary';
forecastToggleBtn.textContent = '5 days';
forecastToggleBtn.title = 'Toggle forecast length';

// Insert the toggle into the forecast header if present
const forecastHead = document.querySelector('.forecast-head');
if (forecastHead) {
    forecastHead.appendChild(forecastToggleBtn);
}
const hourlyTitleEl = document.getElementById('hourlyTitle');
const hourlySubtitleEl = document.getElementById('hourlySubtitle');
const hourlyContainerEl = document.getElementById('hourlyContainer');
const suggestionsEl = document.getElementById('suggestions');
const rainOverlay = document.getElementById('rainOverlay');
const statusToast = document.getElementById('statusToast');
const loadingOverlay = document.getElementById('loadingOverlay');

const weatherOrb = document.getElementById('weatherOrb');
const weatherIcon = document.getElementById('weatherIcon');
const tempEl = document.getElementById('temp');
const conditionEl = document.getElementById('condition');
const cityNameEl = document.getElementById('cityName');
const dateEl = document.getElementById('date');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const visibilityEl = document.getElementById('visibility');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const aqiEl = document.getElementById('aqi');
const aqiLabelEl = document.getElementById('aqiLabel');
const mapPreviewEl = document.getElementById('mapPreview');
const locationLineEl = document.getElementById('locationLine');
const alertPanelEl = document.getElementById('alertPanel');
const alertListEl = document.getElementById('alertList');
const uvIndexEl = document.getElementById('uvIndex');
const dayPhaseEl = document.getElementById('dayPhase');

const settingsPopover = document.getElementById('settingsPopover');
const settingsUnitBtn = document.getElementById('settingsUnitBtn');
const settingsUnitValue = document.getElementById('settingsUnitValue');
const settingsThemeBtn = document.getElementById('settingsThemeBtn');
const settingsThemeValue = document.getElementById('settingsThemeValue');
const settingsRadarBtn = document.getElementById('settingsRadarBtn');
const settingsRadarValue = document.getElementById('settingsRadarValue');
const settingsSaveFavoriteBtn = document.getElementById('settingsSaveFavoriteBtn');
const settingsClearFavoritesBtn = document.getElementById('settingsClearFavoritesBtn');
const topSettingsBtn = document.getElementById('topSettingsBtn');
const navSettingsBtn = document.getElementById('navSettingsBtn');

const weatherCodeMap = {
    0: { description: 'Clear sky', icon: '☀️', anim: 'clear-day', mood: 'sunny' },
    1: { description: 'Mainly clear', icon: '🌤️', anim: 'partly-cloudy-day', mood: 'sunny' },
    2: { description: 'Partly cloudy', icon: '⛅', anim: 'partly-cloudy-day', mood: 'cloudy' },
    3: { description: 'Cloudy', icon: '☁️', anim: 'overcast', mood: 'cloudy' },
    45: { description: 'Fog', icon: '🌫️', anim: 'fog', mood: 'fog' },
    48: { description: 'Rime fog', icon: '🌫️', anim: 'fog', mood: 'fog' },
    51: { description: 'Light drizzle', icon: '🌦️', anim: 'drizzle', mood: 'rain' },
    53: { description: 'Moderate drizzle', icon: '🌦️', anim: 'drizzle', mood: 'rain' },
    55: { description: 'Heavy drizzle', icon: '🌦️', anim: 'drizzle', mood: 'rain' },
    61: { description: 'Slight rain', icon: '🌧️', anim: 'rain', mood: 'rain' },
    63: { description: 'Moderate rain', icon: '🌧️', anim: 'rain', mood: 'rain' },
    65: { description: 'Heavy rain', icon: '🌧️', anim: 'extreme-rain', mood: 'rain' },
    71: { description: 'Slight snow', icon: '🌨️', anim: 'snow', mood: 'snow' },
    73: { description: 'Moderate snow', icon: '🌨️', anim: 'snow', mood: 'snow' },
    75: { description: 'Heavy snow', icon: '🌨️', anim: 'extreme-snow', mood: 'snow' },
    80: { description: 'Rain showers', icon: '🌦️', anim: 'rain', mood: 'rain' },
    81: { description: 'Heavy showers', icon: '🌦️', anim: 'extreme-rain', mood: 'rain' },
    82: { description: 'Violent showers', icon: '🌦️', anim: 'extreme-rain', mood: 'storm' },
    95: { description: 'Thunderstorm', icon: '⛈️', anim: 'thunderstorms', mood: 'storm' },
    96: { description: 'Thunderstorm with hail', icon: '⛈️', anim: 'thunderstorms-rain', mood: 'storm' },
    99: { description: 'Thunderstorm with hail', icon: '⛈️', anim: 'thunderstorms-rain', mood: 'storm' }
};

const ANIM_ICON_BASE = 'https://cdn.jsdelivr.net/gh/basmilius/weather-icons@dev/production/fill/svg/';

function getWeatherIconUrl(code) {
    const meta = getWeatherMeta(code);
    return `${ANIM_ICON_BASE}${meta.anim || 'cloudy'}.svg`;
}

const orbThemes = {
    sunny: 'conic-gradient(from 0deg, #ffb258, #ffdca6, #ffb258)',
    cloudy: 'conic-gradient(from 0deg, #7c5cff, #b8c2ff, #7c5cff)',
    rain: 'conic-gradient(from 0deg, #22d3ee, #7c5cff, #22d3ee)',
    storm: 'conic-gradient(from 0deg, #6a3bff, #22d3ee, #6a3bff)',
    snow: 'conic-gradient(from 0deg, #a7c5ff, #ffffff, #a7c5ff)',
    fog: 'conic-gradient(from 0deg, #94a3b8, #cbd5e1, #94a3b8)'
};

let toastTimer;
let selectedDayIndex = 0;
let forecastDays = 5; // default — toggled by user
function showToast(message, isError = false) {
    statusToast.textContent = message;
    statusToast.classList.toggle('error', isError);
    statusToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        statusToast.classList.remove('show');
    }, 4200);
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatDay(timestamp) {
    return new Date(timestamp).toLocaleDateString([], {
        weekday: 'short'
    });
}

const STORAGE_KEYS = {
    theme: 'weatherXTheme',
    unit: 'weatherXUnit',
    favorites: 'weatherXFavorites',
    recent: 'weatherXRecent'
};

let currentUnit = localStorage.getItem(STORAGE_KEYS.unit) || 'C';
let currentPlace = null;
let currentWeather = null;
let favorites = [];
let recentCities = [];

function getWeatherMeta(code) {
    return weatherCodeMap[code] || { description: 'Weather update', icon: '🌤️', mood: 'cloudy' };
}

function getWeatherIconDataUri(code) {
    const meta = getWeatherMeta(code);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
            <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-size="150">${meta.icon}</text>
        </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function cToF(value) {
    return value * 9 / 5 + 32;
}

function kmhToMph(value) {
    return value * 0.621371;
}

function kmToMiles(value) {
    return value * 0.621371;
}

function formatTemp(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
    }
    return currentUnit === 'F'
        ? `${Math.round(cToF(value))}°F`
        : `${Math.round(value)}°C`;
}

function formatWind(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
    }
    return currentUnit === 'F'
        ? `${Math.round(kmhToMph(value))} mph`
        : `${Math.round(value)} km/h`;
}

function formatVisibility(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
    }
    const km = value / 1000;
    return currentUnit === 'F'
        ? `${Math.round(kmToMiles(km))} mi`
        : `${Math.round(km)} km`;
}

function getDayPhase(sunrise, sunset) {
    const now = new Date();
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    if (now >= sunriseTime && now < sunsetTime) {
        return 'Day';
    }
    return 'Night';
}

function getAqiCategory(pm25) {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35.4) return 'Moderate';
    if (pm25 <= 55.4) return 'Unhealthy for sensitive groups';
    if (pm25 <= 150.4) return 'Unhealthy';
    if (pm25 <= 250.4) return 'Very unhealthy';
    return 'Hazardous';
}

function findClosestHourlyIndex(hourly) {
    if (!hourly || !hourly.time || hourly.time.length === 0) return -1;
    const now = new Date();
    let bestIndex = 0;
    let smallestDiff = Infinity;
    hourly.time.forEach((time, index) => {
        const candidate = new Date(time);
        const diff = Math.abs(candidate - now);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            bestIndex = index;
        }
    });
    return bestIndex;
}

let leafletMap = null;
let currentTileLayer = null;
let currentPlaceMarker = null;
const extraPlaceMarkers = [];
let mapLayerMode = 'dark';

const TILE_LAYERS = {
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    },
    street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors'
    }
};

function initLeafletMap() {
    if (leafletMap || typeof L === 'undefined' || !document.getElementById('leafletMap')) return;

    leafletMap = L.map('leafletMap', {
        zoomControl: false,
        attributionControl: false
    }).setView([28.6, 77.2], 6);

    const layer = TILE_LAYERS[mapLayerMode];
    currentTileLayer = L.tileLayer(layer.url, { attribution: layer.attribution, maxZoom: 18 }).addTo(leafletMap);
}

function setMapLayer(mode) {
    if (!leafletMap) return;
    mapLayerMode = mode;
    if (currentTileLayer) {
        leafletMap.removeLayer(currentTileLayer);
    }
    const layer = TILE_LAYERS[mode];
    currentTileLayer = L.tileLayer(layer.url, { attribution: layer.attribution, maxZoom: 18 }).addTo(leafletMap);
}

function makeBubbleIcon(name, tempValue, code, isCurrent) {
    const meta = getWeatherMeta(code);
    return L.divIcon({
        className: '',
        html: `
            <div class="map-city-bubble${isCurrent ? ' is-current' : ''}">
                <span class="bubble-pin">
                    <span class="bubble-icon">${meta.icon}</span>
                    <span class="bubble-temp">${formatTemp(tempValue)}</span>
                </span>
                <span class="bubble-name">${name}</span>
            </div>
        `,
        iconSize: [90, 74],
        iconAnchor: [45, 60]
    });
}

async function fetchQuickCurrent(latitude, longitude) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
        if (!response.ok) return null;
        const data = await response.json();
        return {
            temp: data.current?.temperature_2m,
            code: data.current?.weather_code
        };
    } catch (error) {
        return null;
    }
}

async function renderMapPreview(place, current) {
    if (!mapPreviewEl) return;
    initLeafletMap();
    if (!leafletMap || !place?.latitude || !place?.longitude) return;

    mapPreviewEl.setAttribute('aria-label', `Map preview for ${place?.display || place?.name || 'location'}`);

    leafletMap.setView([place.latitude, place.longitude], 11, { animate: true });

    if (currentPlaceMarker) {
        leafletMap.removeLayer(currentPlaceMarker);
    }
    currentPlaceMarker = L.marker([place.latitude, place.longitude], {
        icon: makeBubbleIcon(place.name || 'You', current?.temperature_2m, current?.weather_code, true)
    }).addTo(leafletMap);

    extraPlaceMarkers.forEach((marker) => leafletMap.removeLayer(marker));
    extraPlaceMarkers.length = 0;

    // Pull a couple of nearby saved / recent places for extra markers, skipping the current spot
    const seen = new Set();
    const extras = [];
    for (const item of [...favorites, ...recentCities]) {
        const key = `${item.latitude},${item.longitude}`;
        if (seen.has(key) || (item.latitude === place?.latitude && item.longitude === place?.longitude)) continue;
        seen.add(key);
        extras.push(item);
        if (extras.length >= 3) break;
    }

    const results = await Promise.all(extras.map((item) => fetchQuickCurrent(item.latitude, item.longitude)));

    extras.forEach((item, index) => {
        const weather = results[index];
        const marker = L.marker([item.latitude, item.longitude], {
            icon: makeBubbleIcon(item.name, weather?.temp, weather?.code, false)
        }).addTo(leafletMap);
        marker.on('click', () => {
            fetchWeatherByCoords(item.latitude, item.longitude, { name: item.name, country: item.country }).catch((error) => {
                showToast(error.message || 'Could not load weather for that place.', true);
            });
        });
        extraPlaceMarkers.push(marker);
    });
}

function renderWeatherAlerts(alerts = []) {
    if (!alerts || alerts.length === 0) {
        alertPanelEl?.classList.add('hide');
        alertListEl.innerHTML = '';
        return;
    }

    alertPanelEl?.classList.remove('hide');
    alertListEl.innerHTML = alerts.map((alert) => {
        const title = alert.event || alert.title || 'Weather alert';
        const description = alert.description || alert.summary || 'Stay aware of local conditions.';
        const timeframe = alert.start && alert.end
            ? `${new Date(alert.start).toLocaleString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })} – ${new Date(alert.end).toLocaleString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}`
            : '';

        return `
            <div class="alert-item">
                <strong>${title}</strong>
                ${timeframe ? `<span>${timeframe}</span>` : ''}
                <p>${description}</p>
            </div>
        `;
    }).join('');
}

function renderAirQuality(pm25) {
    if (pm25 === null || pm25 === undefined || Number.isNaN(pm25)) {
        aqiEl.textContent = '--';
        aqiLabelEl.textContent = 'Not available';
        return;
    }

    aqiEl.textContent = Math.round(pm25);
    aqiLabelEl.textContent = getAqiCategory(pm25);
}

async function fetchAirQuality(latitude, longitude) {
    try {
        const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5&timezone=auto`);
        if (!response.ok) {
            throw new Error('Air quality unavailable.');
        }

        const data = await response.json();
        const index = findClosestHourlyIndex(data.hourly);
        const pm25 = data.hourly?.pm2_5?.[index];
        renderAirQuality(pm25);
    } catch (error) {
        renderAirQuality(null);
    }
}

function loadStorageLists() {
    try {
        favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]') || [];
    } catch (error) {
        favorites = [];
    }

    try {
        recentCities = JSON.parse(localStorage.getItem(STORAGE_KEYS.recent) || '[]') || [];
    } catch (error) {
        recentCities = [];
    }
}

function saveStorageLists() {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentCities));
}

function renderCityChips() {
    favoritesListEl.innerHTML = favorites.map((place, index) => `
        <button type="button" class="chip" data-index="${index}" data-lat="${place.latitude}" data-lon="${place.longitude}">
            ${place.display}
        </button>
    `).join('');

    recentListEl.innerHTML = recentCities.map((place, index) => `
        <button type="button" class="chip" data-index="${index}" data-lat="${place.latitude}" data-lon="${place.longitude}">
            ${place.display}
        </button>
    `).join('');
}

function addRecentPlace(place) {
    if (!place || !place.latitude || !place.longitude) {
        return;
    }

    const existingIndex = recentCities.findIndex((item) => item.latitude === place.latitude && item.longitude === place.longitude);
    if (existingIndex !== -1) {
        recentCities.splice(existingIndex, 1);
    }

    recentCities.unshift({
        name: place.name,
        country: place.country || '',
        latitude: place.latitude,
        longitude: place.longitude,
        display: `${place.name}${place.country ? `, ${place.country}` : ''}`
    });

    if (recentCities.length > 6) {
        recentCities.pop();
    }
    saveStorageLists();
    renderCityChips();
}

function addFavoritePlace() {
    if (!currentPlace) {
        showToast('Search a city first before saving a favorite.', true);
        return;
    }

    const exists = favorites.some((item) => item.latitude === currentPlace.latitude && item.longitude === currentPlace.longitude);
    if (exists) {
        showToast(`${currentPlace.name} is already in favorites.`);
        return;
    }

    favorites.unshift({
        name: currentPlace.name,
        country: currentPlace.country || '',
        latitude: currentPlace.latitude,
        longitude: currentPlace.longitude,
        display: `${currentPlace.name}${currentPlace.country ? `, ${currentPlace.country}` : ''}`
    });

    saveStorageLists();
    renderCityChips();
    showToast(`${currentPlace.name} saved to favorites.`);
}

function clearFavoritePlaces() {
    favorites = [];
    saveStorageLists();
    renderCityChips();
    showToast('Favorites cleared.');
}

function setCurrentPlace(place) {
    currentPlace = place;
    addRecentPlace(place);
}

function updateUnitButton() {
    const label = currentUnit === 'F' ? '°F' : '°C';
    if (settingsUnitValue) settingsUnitValue.textContent = label;
    localStorage.setItem(STORAGE_KEYS.unit, currentUnit);
}

function toggleUnit() {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    updateUnitButton();
    if (currentWeather && currentPlace) {
        renderWeather(currentPlace, currentWeather.current, currentWeather.daily, currentWeather.hourly);
    }
}

function applyWeatherEffects(code) {
    const meta = getWeatherMeta(code);
    const isRainy = ['rain', 'storm'].includes(meta.mood);
    document.body.classList.toggle('rainy', isRainy);
    document.body.classList.toggle('stormy', meta.mood === 'storm');
    rainOverlay.classList.toggle('active', isRainy);
    weatherOrb.style.background = orbThemes[meta.mood] || orbThemes.cloudy;
}

function setIconWithFallback(imgEl, code) {
    imgEl.src = getWeatherIconUrl(code);
    imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = getWeatherIconDataUri(code);
    };
}

function getHourlySlots(hourly, dayDate) {
    const dayKey = dayDate.slice(0, 10);
    return (hourly?.time || [])
        .map((time, index) => ({
            time,
            temperature: hourly.temperature_2m?.[index],
            weather_code: hourly.weather_code?.[index],
            precipitation_probability: hourly.precipitation_probability?.[index],
            wind_speed: hourly.wind_speed_10m?.[index]
        }))
        .filter((entry) => entry.time.startsWith(dayKey));
}

function renderHourlyForecast(index, daily, hourly, place) {
    const selectedDay = daily.time[index];
    if (!selectedDay) {
        return;
    }

    const dayLabel = new Date(selectedDay).toLocaleDateString([], {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });

    hourlyTitleEl.textContent = `${dayLabel} hours`;
    hourlySubtitleEl.textContent = `${place?.name || 'Forecast'} • hourly outlook`;
    hourlyContainerEl.innerHTML = '';

    const slots = getHourlySlots(hourly, selectedDay);
    if (!slots.length) {
        hourlyContainerEl.innerHTML = '<p class="empty-state">Hourly data is not available for this day yet.</p>';
        return;
    }

    slots.forEach((slot) => {
        const card = document.createElement('div');
        card.className = 'hour-item';
        const meta = getWeatherMeta(slot.weather_code);

        card.innerHTML = `
            <p class="hour-label">${formatTime(slot.time)}</p>
            <img alt="${meta.description}">
            <p class="hour-temp">${formatTemp(slot.temperature)}</p>
            <p class="hour-precip">${Math.round(slot.precipitation_probability || 0)}%</p>
        `;

        setIconWithFallback(card.querySelector('img'), slot.weather_code);
        hourlyContainerEl.appendChild(card);
    });
}

function renderWeather(place, current, daily, hourly = null) {
    currentPlace = place;
    currentWeather = { current, daily, hourly };

    const meta = getWeatherMeta(current.weather_code);

    setIconWithFallback(weatherIcon, current.weather_code);
    weatherIcon.alt = meta.description;

    tempEl.textContent = formatTemp(current.temperature_2m);
    conditionEl.textContent = meta.description;
    cityNameEl.textContent = place.country ? `${place.name}, ${place.country}` : place.name;
    dateEl.textContent = new Date().toLocaleDateString([], {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    feelsLikeEl.textContent = formatTemp(current.apparent_temperature);
    humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    windEl.textContent = formatWind(current.wind_speed_10m);
    visibilityEl.textContent = formatVisibility(current.visibility);
    sunriseEl.textContent = formatTime(daily.sunrise[0]);
    sunsetEl.textContent = formatTime(daily.sunset[0]);
    uvIndexEl.textContent = current.uv_index !== undefined ? current.uv_index.toFixed(1) : '--';
    dayPhaseEl.textContent = getDayPhase(daily.sunrise[0], daily.sunset[0]);
    locationLineEl.textContent = place.display || `${place.name}${place.country ? `, ${place.country}` : ''}`;
    renderMapPreview(place, current);
    applyWeatherEffects(current.weather_code);

    forecastContainer.innerHTML = '';
    const dayEntries = daily.time.slice(0, forecastDays);
    selectedDayIndex = 0;

    dayEntries.forEach((time, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `forecast-day${index === 0 ? ' active' : ''}`;
        card.dataset.index = String(index);
        const dayMeta = getWeatherMeta(daily.weather_code[index]);
        const lowTemp = daily.temperature_2m_min ? daily.temperature_2m_min[index] : null;

        card.innerHTML = `
            <span class="fday-name">${formatDay(time)}</span>
            <img alt="${dayMeta.description}">
            <span class="fday-temps">${formatTemp(daily.temperature_2m_max[index])}${lowTemp !== null ? ` <span class="low">${formatTemp(lowTemp)}</span>` : ''}</span>
        `;

        card.addEventListener('click', () => {
            selectedDayIndex = index;
            document.querySelectorAll('.forecast-day').forEach((element) => {
                element.classList.toggle('active', Number(element.dataset.index) === selectedDayIndex);
            });
            renderHourlyForecast(selectedDayIndex, daily, hourly, place);
        });

        setIconWithFallback(card.querySelector('img'), daily.weather_code[index]);
        forecastContainer.appendChild(card);
    });

    renderHourlyForecast(selectedDayIndex, daily, hourly, place);
}

async function geocodeCity(city) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=8&countryCode=IN&language=en&format=json`);

    if (!response.ok) {
        throw new Error('Could not reach the weather service.');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error('No matching places were found. Please refine your search.');
    }

    return data.results[0];
}

async function fallbackLocationFromIp() {
    const endpoints = ['https://ipinfo.io/json', 'https://ipapi.co/json/'];

    for (const url of endpoints) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                continue;
            }

            const data = await response.json();
            const name = [data.city, data.region, data.country_name || data.country].filter(Boolean).join(', ');
            if (name) {
                return {
                    name,
                    country: data.country_name || data.country || ''
                };
            }
        } catch (error) {
            continue;
        }
    }

    return { name: 'Your location', country: '' };
}

async function reverseGeocode(latitude, longitude) {
    const candidates = [
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
    ];

    for (const url of candidates) {
        try {
            const response = await fetch(url, {
                headers: url.includes('nominatim') ? { 'Accept-Language': 'en', 'User-Agent': 'WeatherX/1.0' } : {}
            });

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            if (url.includes('nominatim')) {
                const address = data.address || {};
                // Prefer the most specific place level first (village/hamlet) so small
                // towns don't get swallowed by the nearest big city.
                const name = address.village || address.hamlet || address.suburb
                    || address.town || address.city_district || address.city
                    || address.county || (data.display_name ? data.display_name.split(',')[0] : '')
                    || address.state || address.country || 'Your location';
                if (name && name !== 'Your location') {
                    return { name, country: address.country || '' };
                }
            }

            if (url.includes('bigdatacloud')) {
                const city = data.locality || data.city || data.localityInfo?.administrative?.[1]?.name || '';
                const district = data.localityInfo?.administrative?.[2]?.name || '';
                const name = city || district || data.cityName || data.localityInfo?.administrative?.[0]?.name || 'Your location';
                if (name && name !== 'Your location') {
                    return { name, country: data.countryName || '' };
                }
            }

            const result = data.results?.[0];
            const name = result?.name || result?.admin1 || result?.admin2 || result?.country || 'Your location';
            if (name && name !== 'Your location') {
                return { name, country: result?.country || '' };
            }
        } catch (error) {
            continue;
        }
    }

    return fallbackLocationFromIp();
}

async function fetchWeatherByCity(city) {
    showLoading();
    try {
        const place = await geocodeCity(city);
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,uv_index&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`);

        if (!response.ok) {
            throw new Error('Could not fetch weather for this city.');
        }

        const data = await response.json();
        setCurrentPlace(place);
        renderWeather(place, data.current, data.daily, data.hourly);
        renderWeatherAlerts(data.alerts);
        await fetchAirQuality(place.latitude, place.longitude);
    } finally {
        hideLoading();
    }
}

async function fetchWeatherByCoords(latitude, longitude, placeOverride = null) {
    showLoading();
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,uv_index&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`);

        if (!response.ok) {
            throw new Error('Could not fetch weather for your current location.');
        }

        const data = await response.json();
        const placeInfo = placeOverride || await reverseGeocode(latitude, longitude);

        const baseName = placeInfo?.name || 'Your location';
        const displayName = baseName.includes(',') ? baseName.split(',')[0] : baseName;

        const place = {
            name: displayName,
            country: placeInfo?.country || '',
            latitude,
            longitude,
            display: `${displayName}${placeInfo?.country ? `, ${placeInfo.country}` : ''}`
        };

        setCurrentPlace(place);
        renderWeather(place, data.current, data.daily, data.hourly);
        renderWeatherAlerts(data.alerts);
        await fetchAirQuality(latitude, longitude);
    } finally {
        hideLoading();
    }
}

async function fetchWeatherByIPGeolocation() {
    const url = 'https://ipinfo.io/json';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('IP lookup failed.');
        }

        const data = await response.json();
        let latitude = Number(data.latitude ?? data.lat);
        let longitude = Number(data.longitude ?? data.lon);

        if (!latitude && !longitude && typeof data.loc === 'string') {
            const [lat, lon] = data.loc.split(',');
            latitude = Number(lat);
            longitude = Number(lon);
        }

        const displayName = [data.city, data.region, data.country_name, data.country].filter(Boolean).join(', ');
        const countryName = data.country_name || data.country || '';

        if (!latitude || !longitude) {
            throw new Error('IP lookup returned invalid coordinates.');
        }

        return await fetchWeatherByCoords(latitude, longitude, {
            name: displayName || 'Your location',
            country: countryName
        });
    } catch (error) {
        showToast('IP lookup failed. Showing a default city instead.', true);
        return await fetchWeatherByCity(defaultCity);
    }
}

function hideSuggestions() {
    suggestionsEl.innerHTML = '';
    suggestionsEl.classList.remove('show');
    suggestionsEl.style.left = '';
    suggestionsEl.style.top = '';
    suggestionsEl.style.width = '';
    suggestionsEl.style.maxHeight = '';
}

function positionSuggestions() {
    const rect = cityInput.getBoundingClientRect();
    const availableHeight = window.innerHeight - rect.bottom - 24;

    suggestionsEl.style.position = 'fixed';
    suggestionsEl.style.left = `${rect.left}px`;
    suggestionsEl.style.top = `${rect.bottom + 10}px`;
    suggestionsEl.style.width = `${rect.width}px`;
    suggestionsEl.style.maxHeight = `${Math.max(160, availableHeight)}px`;
}

async function searchSuggestions(query) {
    if (query.trim().length < 2) {
        hideSuggestions();
        return;
    }

    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&countryCode=IN&language=en&format=json`);
        const data = await response.json();
        const results = data.results || [];

        if (!results.length) {
            hideSuggestions();
            return;
        }

        suggestionsEl.innerHTML = results.map((item) => {
            const display = `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}${item.country ? `, ${item.country}` : ''}`;
            return `
            <button type="button" class="suggestion-item" role="option" data-lat="${item.latitude}" data-lon="${item.longitude}" data-display="${display}" data-name="${item.name}" data-country="${item.country || ''}">
                ${display}
            </button>
        `;
        }).join('');

        positionSuggestions();
        suggestionsEl.classList.add('show');
    } catch (error) {
        hideSuggestions();
    }
}

async function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        return;
    }

    searchBtn.disabled = true;
    try {
        await fetchWeatherByCity(city);
        cityInput.value = '';
        hideSuggestions();
    } catch (error) {
        showToast(error.message || 'Something went wrong while searching.', true);
    } finally {
        searchBtn.disabled = false;
    }
}

function geoErrorMessage(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location access was blocked. Enable it in your browser\'s site settings, or just search a city instead.';
        case error.POSITION_UNAVAILABLE:
            return 'Your location could not be determined right now.';
        case error.TIMEOUT:
            return 'Location request timed out. Please try again.';
        default:
            return 'Could not access your location.';
    }
}

function requestLocationWeather() {
    if (!window.isSecureContext) {
        showToast('Location needs a secure (https or localhost) connection. Showing a default city instead.', true);
        return fetchWeatherByCity(defaultCity);
    }

    if (!navigator.geolocation) {
        showToast('Your browser does not support geolocation. Showing a default city instead.', true);
        return fetchWeatherByCity(defaultCity);
    }
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                    showToast("📍 Live location detected successfully.");
                    const accuracy = position.coords.accuracy;
                    if (accuracy && accuracy > 20000) {
                        showToast(`Location accuracy is low (~${Math.round(accuracy / 1000)} km) — your browser is estimating via Wi-Fi, not GPS. Search your city for a precise result.`, true);
                    }
                } catch (error) {
                    showToast(error.message || 'Could not load weather for your location.', true);
                    try {
                        await fetchWeatherByCity(defaultCity);
                    } catch (fallbackError) {
                        showToast(fallbackError.message, true);
                    }
                }
                resolve();
            },
            async (error) => {
                showToast(geoErrorMessage(error), true);
                try {
                    await fetchWeatherByIPGeolocation();
                } catch (ipError) {
                    try {
                        await fetchWeatherByCity(defaultCity);
                    } catch (fallbackError) {
                        showToast(fallbackError.message, true);
                    }
                }
                resolve();
            },
           {
                 enableHighAccuracy: false,
                 timeout: 20000,
                 maximumAge: 600000
            }
        );
    });
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

let suggestionTimer;
cityInput.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    clearTimeout(suggestionTimer);

    if (!value) {
        hideSuggestions();
        return;
    }

    suggestionTimer = setTimeout(() => {
        searchSuggestions(value);
    }, 250);
});

cityInput.addEventListener('focus', () => {
    if (cityInput.value.trim()) {
        searchSuggestions(cityInput.value.trim());
    }
});

cityInput.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 140);
});

suggestionsEl.addEventListener('click', (event) => {

    const item = event.target.closest('.suggestion-item');

    if (!item) return;

    cityInput.value = item.dataset.name;

    hideSuggestions();


});

locationBtn.addEventListener('click', async () => {
    const icon = locationBtn.querySelector('i');
    const previousClass = icon.className;
    locationBtn.disabled = true;
    icon.className = 'fa-solid fa-spinner fa-spin';

    try {
        await requestLocationWeather();
    } finally {
        icon.className = previousClass;
        locationBtn.disabled = false;
    }
});

function handleSavedCityClick(event) {
    const button = event.target.closest('.chip');
    if (!button) {
        return;
    }

    const latitude = Number(button.dataset.lat);
    const longitude = Number(button.dataset.lon);
    const display = `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}`;

    if (!latitude || !longitude) {
        return;
    }

    fetchWeatherByCoords(latitude, longitude, {
        name: display,
        country: ''
    }).catch((error) => {
        showToast(error.message || 'Could not load saved city weather.', true);
    });
}

favoritesListEl.addEventListener('click', handleSavedCityClick);
recentListEl.addEventListener('click', handleSavedCityClick);

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('weatherXTheme', theme);
}

// Default to dark theme unless the user has a saved preference
const preferredTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
applyTheme(preferredTheme);
updateUnitButton();
loadStorageLists();
renderCityChips();

// Forecast toggle behavior
forecastToggleBtn.addEventListener('click', () => {
    forecastDays = forecastDays === 5 ? 7 : 5;
    forecastToggleBtn.textContent = `${forecastDays} days`;
    if (currentWeather && currentPlace) {
        renderWeather(currentPlace, currentWeather.current, currentWeather.daily, currentWeather.hourly);
    }
});

window.addEventListener('resize', () => {
    if (suggestionsEl.classList.contains('show')) {
        positionSuggestions();
    }
});

window.addEventListener('scroll', () => {
    if (suggestionsEl.classList.contains('show')) {
        positionSuggestions();
    }
});

// ============================================================
// Sidebar navigation — real functionality for each rail icon
// ============================================================

const navDashboardBtn = document.getElementById('navDashboardBtn');
const navMapBtn = document.getElementById('navMapBtn');
const navLocationBtn = document.getElementById('navLocationBtn');
const navRadarBtn = document.getElementById('navRadarBtn');
const navCalendarBtn = document.getElementById('navCalendarBtn');
const navAlertsBtn = document.getElementById('navAlertsBtn');
const navAlertBadge = document.getElementById('navAlertBadge');

const dashboardSection = document.getElementById('dashboardSection');
const mapSection = document.getElementById('mapSection');
const forecastSection = document.getElementById('forecastSection');
const wcSearchBtn = document.getElementById('wcSearchBtn');

const viewNavButtons = [navDashboardBtn, navMapBtn, navCalendarBtn].filter(Boolean);

function setActiveViewNav(button) {
    viewNavButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
}

function scrollToSection(section) {
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- Dashboard / Map / Calendar act as quick-jump tabs ---
navDashboardBtn?.addEventListener('click', () => {
    setActiveViewNav(navDashboardBtn);
    scrollToSection(dashboardSection);
});

navMapBtn?.addEventListener('click', () => {
    setActiveViewNav(navMapBtn);
    scrollToSection(mapSection);
});

navCalendarBtn?.addEventListener('click', () => {
    setActiveViewNav(navCalendarBtn);
    scrollToSection(forecastSection);
    forecastToggleBtn.click();
});

// --- Location icon reuses the same geolocation flow as the search bar button ---
navLocationBtn?.addEventListener('click', async () => {
    const icon = navLocationBtn.querySelector('i');
    const previousClass = icon.className;
    navLocationBtn.disabled = true;
    icon.className = 'fa-solid fa-spinner fa-spin';
    try {
        await requestLocationWeather();
    } finally {
        icon.className = previousClass;
        navLocationBtn.disabled = false;
    }
});

// --- Small search icon inside the weather card focuses the real search input ---
function focusSearchBox() {
    cityInput.focus();
    cityInput.closest('.search-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

wcSearchBtn?.addEventListener('click', focusSearchBox);
wcSearchBtn?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        focusSearchBox();
    }
});

// --- Radar icon toggles a live auto-refresh of the current location's weather ---
const AUTO_REFRESH_MS = 5 * 60 * 1000;
let autoRefreshTimer = null;

function refreshCurrentWeather() {
    if (!currentPlace) return;
    fetchWeatherByCoords(currentPlace.latitude, currentPlace.longitude, {
        name: currentPlace.name,
        country: currentPlace.country
    }).catch((error) => {
        showToast(error.message || 'Could not refresh weather.', true);
    });
}

function setAutoRefresh(enabled) {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }

    if (enabled) {
        autoRefreshTimer = setInterval(refreshCurrentWeather, AUTO_REFRESH_MS);
        showToast('Live auto-refresh turned on — updating every 5 minutes.');
    } else {
        showToast('Auto-refresh turned off.');
    }

    navRadarBtn?.classList.toggle('active', enabled);
    settingsRadarBtn?.classList.toggle('on', enabled);
    if (settingsRadarValue) settingsRadarValue.textContent = enabled ? 'On' : 'Off';
    localStorage.setItem('weatherXAutoRefresh', enabled ? '1' : '0');
}

navRadarBtn?.addEventListener('click', () => setAutoRefresh(!autoRefreshTimer));
settingsRadarBtn?.addEventListener('click', () => setAutoRefresh(!autoRefreshTimer));

if (localStorage.getItem('weatherXAutoRefresh') === '1') {
    setAutoRefresh(true);
}

// --- Settings icon opens a small popover with quick unit / theme / auto-refresh controls ---
function closeSettingsPopover() {
    settingsPopover?.classList.remove('show');
    settingsPopover?.setAttribute('aria-hidden', 'true');
    navSettingsBtn?.classList.remove('active');
}

function openSettingsPopover() {
    settingsPopover?.classList.add('show');
    settingsPopover?.setAttribute('aria-hidden', 'false');
    navSettingsBtn?.classList.add('active');
    if (settingsUnitValue) settingsUnitValue.textContent = currentUnit === 'F' ? '°F' : '°C';
    if (settingsThemeValue) settingsThemeValue.textContent = document.body.classList.contains('dark') ? 'Dark' : 'Light';
}

navSettingsBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (settingsPopover?.classList.contains('show')) {
        closeSettingsPopover();
    } else {
        openSettingsPopover();
    }
});

topSettingsBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (settingsPopover?.classList.contains('show')) {
        closeSettingsPopover();
    } else {
        openSettingsPopover();
    }
});

document.addEventListener('click', (event) => {
    if (!settingsPopover || !settingsPopover.classList.contains('show')) {
        return;
    }
    if (
        settingsPopover.contains(event.target)
        || event.target === navSettingsBtn || navSettingsBtn?.contains(event.target)
        || event.target === topSettingsBtn || topSettingsBtn?.contains(event.target)
    ) {
        return;
    }
    closeSettingsPopover();
});

settingsUnitBtn?.addEventListener('click', () => {
    toggleUnit();
});

settingsThemeBtn?.addEventListener('click', () => {
    applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    if (settingsThemeValue) settingsThemeValue.textContent = document.body.classList.contains('dark') ? 'Dark' : 'Light';
});

settingsSaveFavoriteBtn?.addEventListener('click', () => {
    addFavoritePlace();
    closeSettingsPopover();
});

settingsClearFavoritesBtn?.addEventListener('click', () => {
    clearFavoritePlaces();
    closeSettingsPopover();
});

// --- Bell icon jumps to live alerts, or confirms there are none right now ---
navAlertsBtn?.addEventListener('click', () => {
    if (alertPanelEl && !alertPanelEl.classList.contains('hide')) {
        scrollToSection(alertPanelEl);
    } else {
        showToast(currentPlace ? `No active weather alerts for ${currentPlace.name}.` : 'No active weather alerts right now.');
    }
});

if (alertPanelEl && navAlertBadge) {
    const syncAlertBadge = () => {
        navAlertBadge.hidden = alertPanelEl.classList.contains('hide');
    };
    syncAlertBadge();
    new MutationObserver(syncAlertBadge).observe(alertPanelEl, { attributes: true, attributeFilter: ['class'] });
}

// --- Map scene controls: zoom, locate, jump-to-list, layer toggle ---
const mapZoomInBtn = document.getElementById('mapZoomInBtn');
const mapZoomOutBtn = document.getElementById('mapZoomOutBtn');
const mapLocateBtn = document.getElementById('mapLocateBtn');
const mapListBtn = document.getElementById('mapListBtn');
const mapLayersBtn = document.getElementById('mapLayersBtn');

mapZoomInBtn?.addEventListener('click', () => leafletMap?.zoomIn());
mapZoomOutBtn?.addEventListener('click', () => leafletMap?.zoomOut());

mapLocateBtn?.addEventListener('click', async () => {
    const icon = mapLocateBtn.querySelector('i');
    const previousClass = icon.className;
    mapLocateBtn.disabled = true;
    icon.className = 'fa-solid fa-spinner fa-spin';
    try {
        await requestLocationWeather();
    } finally {
        icon.className = previousClass;
        mapLocateBtn.disabled = false;
    }
});

mapListBtn?.addEventListener('click', () => {
    document.querySelector('.chip-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

mapLayersBtn?.addEventListener('click', () => {
    setMapLayer(mapLayerMode === 'dark' ? 'street' : 'dark');
});

(async () => {
    try {
        await requestLocationWeather();
    } catch (error) {
        console.error(error);
        showToast('Could not load weather right now. Please try searching a city.', true);
    }
})();