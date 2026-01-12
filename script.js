
const url = 'https://air-quality-by-api-ninjas.p.rapidapi.com/v1/airquality?city=Gorakhpur';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '1467804556msha2c58a7a8f50cfdp1a3f47jsn532f289109e1',
		'x-rapidapi-host': 'air-quality-by-api-ninjas.p.rapidapi.com'
	}
};

async function fetchAQI() {
	try {
		const response = await fetch(url, options);
		const result = await response.json();
		const data = result || diff;

		const CO_concentration = data.CO?.concentration;
		const CO_aqi = data.CO?.aqi;

		const NO2_concentration = data.NO2?.concentration;
		const NO2_aqi = data.NO2?.aqi;

		const O3_concentration = data.O3?.concentration;
		const O3_aqi = data.O3?.aqi;

		const SO2_concentration = data.SO2?.concentration;
		const SO2_aqi = data.SO2?.aqi;

		const PM25_concentration = data["PM2.5"]?.concentration;
		const PM25_aqi = data["PM2.5"]?.aqi;

		const PM10_concentration = data.PM10?.concentration;
		const PM10_aqi = data.PM10?.aqi;

		const overall_aqi = data.overall_aqi;

		const city = data.city ?? (new URL(url).searchParams.get('city')) ?? 'City Name';

		console.log({
			CO_concentration, CO_aqi,
			NO2_concentration, NO2_aqi,
			O3_concentration, O3_aqi,
			
			SO2_concentration, SO2_aqi,
			PM25_concentration, PM25_aqi,
			PM10_concentration, PM10_aqi,
			overall_aqi
		});
		console.log("hi");

		function safeSet(id, value) {
			const el = document.getElementById(id);
			if (!el) return;
			el.textContent = value;
		}

		safeSet('aqi-title', `AQI — ${city}`);
		safeSet('overall_aqi', overall_aqi ?? '—');

		safeSet('CO', `{concentration: ${CO_concentration ?? '—'}, aqi: ${CO_aqi ?? '—'}}`);
		safeSet('NO2', `{concentration: ${NO2_concentration ?? '—'}, aqi: ${NO2_aqi ?? '—'}}`);
		safeSet('O3', `{concentration: ${O3_concentration ?? '—'}, aqi: ${O3_aqi ?? '—'}}`);
		safeSet('SO2', `{concentration: ${SO2_concentration ?? '—'}, aqi: ${SO2_aqi ?? '—'}}`);
		safeSet('PM25', `{concentration: ${PM25_concentration ?? '—'}, aqi: ${PM25_aqi ?? '—'}}`);
		safeSet('PM10', `{concentration: ${PM10_concentration ?? '—'}, aqi: ${PM10_aqi ?? '—'}}`);
	} catch (error) {
		console.error(error);
	}
}

fetchAQI();