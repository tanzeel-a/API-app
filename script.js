/**
 * AQI Finder - Air Quality Index Application
 * Fetches and displays real-time air quality data for any city
 */

// ============================================
// Configuration
// ============================================

/**
 * NOTE: For vanilla JavaScript, we cannot directly read .env files.
 * In production, you would:
 * 1. Use a build tool (Vite, Webpack) with dotenv
 * 2. Use a backend proxy to hide API keys
 * 3. Use serverless functions
 * 
 * For this demo, the key is stored here but .env is included for reference.
 * DO NOT commit this file with your actual API key in production!
 */
const CONFIG = {
    API_KEY: '1467804556msha2c58a7a8f50cfdp1a3f47jsn532f289109e1',
    API_HOST: 'air-quality-by-api-ninjas.p.rapidapi.com',
    DEFAULT_CITY: 'Gorakhpur'
};

// ============================================
// AQI Level Definitions (EPA Standard)
// ============================================
const AQI_LEVELS = {
    GOOD: {
        min: 0,
        max: 50,
        label: 'Good',
        description: 'Air quality is satisfactory. Enjoy outdoor activities!',
        className: 'aqi-good',
        particleColor: '#22c55e'
    },
    MODERATE: {
        min: 51,
        max: 100,
        label: 'Moderate',
        description: 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.',
        className: 'aqi-moderate',
        particleColor: '#eab308'
    },
    SENSITIVE: {
        min: 101,
        max: 150,
        label: 'Unhealthy for Sensitive Groups',
        description: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
        className: 'aqi-sensitive',
        particleColor: '#f97316'
    },
    UNHEALTHY: {
        min: 151,
        max: 200,
        label: 'Unhealthy',
        description: 'Some members of the general public may experience health effects. Sensitive groups may experience more serious effects.',
        className: 'aqi-unhealthy',
        particleColor: '#ef4444'
    },
    VERY_UNHEALTHY: {
        min: 201,
        max: 300,
        label: 'Very Unhealthy',
        description: 'Health alert! Everyone may experience more serious health effects.',
        className: 'aqi-very-unhealthy',
        particleColor: '#a855f7'
    },
    HAZARDOUS: {
        min: 301,
        max: Infinity,
        label: 'Hazardous',
        description: 'Health warning of emergency conditions. The entire population is likely to be affected.',
        className: 'aqi-hazardous',
        particleColor: '#7f1d1d'
    }
};

// ============================================
// DOM Elements
// ============================================
const DOM = {
    searchForm: document.getElementById('search-form'),
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    aqiHero: document.getElementById('aqi-hero'),
    cityName: document.getElementById('aqi-title'),
    overallAqi: document.getElementById('overall_aqi'),
    aqiStatus: document.getElementById('aqi-status'),
    aqiDescription: document.getElementById('aqi-description'),
    animationContainer: document.getElementById('animation-container'),
    particles: document.getElementById('particles'),
    // Pollutant elements
    pollutants: {
        CO: { conc: document.getElementById('CO-conc'), aqi: document.getElementById('CO-aqi'), card: document.getElementById('card-CO') },
        NO2: { conc: document.getElementById('NO2-conc'), aqi: document.getElementById('NO2-aqi'), card: document.getElementById('card-NO2') },
        O3: { conc: document.getElementById('O3-conc'), aqi: document.getElementById('O3-aqi'), card: document.getElementById('card-O3') },
        PM25: { conc: document.getElementById('PM25-conc'), aqi: document.getElementById('PM25-aqi'), card: document.getElementById('card-PM25') },
        PM10: { conc: document.getElementById('PM10-conc'), aqi: document.getElementById('PM10-aqi'), card: document.getElementById('card-PM10') },
        SO2: { conc: document.getElementById('SO2-conc'), aqi: document.getElementById('SO2-aqi'), card: document.getElementById('card-SO2') }
    }
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get AQI level data based on AQI value
 * @param {number} aqi - The AQI value
 * @returns {Object} AQI level data
 */
function getAQILevel(aqi) {
    if (aqi === null || aqi === undefined || isNaN(aqi)) {
        return AQI_LEVELS.MODERATE; // Default fallback
    }
    
    for (const level of Object.values(AQI_LEVELS)) {
        if (aqi >= level.min && aqi <= level.max) {
            return level;
        }
    }
    return AQI_LEVELS.HAZARDOUS;
}

/**
 * Get color for individual pollutant based on its AQI
 * @param {number} aqi - Pollutant AQI value
 * @returns {string} CSS color value
 */
function getPollutantColor(aqi) {
    const level = getAQILevel(aqi);
    return level.particleColor;
}

/**
 * Create floating particles for animation
 * @param {string} color - Particle color
 */
function createParticles(color) {
    DOM.particles.innerHTML = '';
    
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${4 + Math.random() * 8}px;
            height: ${4 + Math.random() * 8}px;
            background: ${color};
            animation-delay: ${Math.random() * 4}s;
            animation-duration: ${3 + Math.random() * 3}s;
        `;
        DOM.particles.appendChild(particle);
    }
}

/**
 * Apply AQI level animation and styling
 * @param {Object} level - AQI level data
 */
function applyAQIAnimation(level) {
    // Remove all previous AQI level classes
    const allClasses = Object.values(AQI_LEVELS).map(l => l.className);
    DOM.aqiHero.classList.remove(...allClasses, 'loading');
    
    // Add new class
    DOM.aqiHero.classList.add(level.className);
    
    // Create particles with level color
    createParticles(level.particleColor);
}

/**
 * Set loading state
 * @param {boolean} isLoading
 */
function setLoading(isLoading) {
    DOM.searchBtn.disabled = isLoading;
    DOM.aqiHero.classList.toggle('loading', isLoading);
    
    if (isLoading) {
        DOM.searchBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"/>
            </svg>
            Loading...
        `;
    } else {
        DOM.searchBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
            </svg>
            Search
        `;
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Remove existing error
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert before main content
    DOM.aqiHero.parentNode.insertBefore(errorDiv, DOM.aqiHero);
    
    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * Update pollutant card with data
 * @param {string} key - Pollutant key (CO, NO2, etc.)
 * @param {number|null} concentration - Concentration value
 * @param {number|null} aqi - AQI value
 */
function updatePollutantCard(key, concentration, aqi) {
    const pollutant = DOM.pollutants[key];
    if (!pollutant) return;
    
    pollutant.conc.textContent = concentration !== null && concentration !== undefined 
        ? concentration.toFixed(1) 
        : '—';
    pollutant.aqi.textContent = aqi !== null && aqi !== undefined 
        ? aqi 
        : '—';
    
    // Set color based on AQI
    const color = getPollutantColor(aqi);
    pollutant.card.style.setProperty('--pollutant-color', color);
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch AQI data for a city
 * @param {string} city - City name
 * @returns {Promise<Object>} API response data
 */
async function fetchAQI(city) {
    const url = `https://${CONFIG.API_HOST}/v1/airquality?city=${encodeURIComponent(city)}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': CONFIG.API_KEY,
            'x-rapidapi-host': CONFIG.API_HOST
        }
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
}

/**
 * Search for a city and update the UI
 * @param {string} city - City name to search
 */
async function searchCity(city) {
    if (!city || city.trim() === '') {
        showError('Please enter a city name');
        return;
    }
    
    setLoading(true);
    
    // Remove any existing errors
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    try {
        const data = await fetchAQI(city.trim());
        
        // Extract data
        const overallAqi = data.overall_aqi;
        const level = getAQILevel(overallAqi);
        
        // Update hero section
        DOM.cityName.textContent = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        DOM.overallAqi.textContent = overallAqi ?? '—';
        DOM.aqiStatus.textContent = level.label;
        DOM.aqiDescription.textContent = level.description;
        
        // Apply animation
        applyAQIAnimation(level);
        
        // Update pollutant cards
        updatePollutantCard('CO', data.CO?.concentration, data.CO?.aqi);
        updatePollutantCard('NO2', data.NO2?.concentration, data.NO2?.aqi);
        updatePollutantCard('O3', data.O3?.concentration, data.O3?.aqi);
        updatePollutantCard('PM25', data['PM2.5']?.concentration, data['PM2.5']?.aqi);
        updatePollutantCard('PM10', data.PM10?.concentration, data.PM10?.aqi);
        updatePollutantCard('SO2', data.SO2?.concentration, data.SO2?.aqi);
        
        console.log('AQI Data:', { city, overallAqi, level: level.label, data });
        
    } catch (error) {
        console.error('Error fetching AQI:', error);
        showError(`Could not fetch data for "${city}". Please check the city name and try again.`);
        
        // Reset to error state
        DOM.cityName.textContent = 'Error Loading Data';
        DOM.overallAqi.textContent = '—';
        DOM.aqiStatus.textContent = 'Unknown';
        DOM.aqiDescription.textContent = 'Unable to fetch air quality data. Please try again.';
    } finally {
        setLoading(false);
    }
}

// ============================================
// Event Listeners
// ============================================

// Search form submission
DOM.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = DOM.cityInput.value;
    searchCity(city);
});

// Allow Enter key in input
DOM.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        DOM.searchForm.dispatchEvent(new Event('submit'));
    }
});

// ============================================
// Initialize App
// ============================================

/**
 * Initialize the application
 */
function init() {
    console.log('AQI Finder initialized');
    
    // Set placeholder with default city
    DOM.cityInput.placeholder = `Search any city... (default: ${CONFIG.DEFAULT_CITY})`;
    
    // Fetch data for default city
    searchCity(CONFIG.DEFAULT_CITY);
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}