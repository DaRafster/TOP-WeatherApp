import './style.css';
import Humidity from './images/humidity.png';
import Rain from './images/rain.png';
import Wind from './images/wind.png';

async function fetchWeatherData(location) {
  try {
    const weatherRequest = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=30b5cfde87b54bedbce23620242106&q=${location}&days=3`
    );

    if (!weatherRequest.ok) {
      throw new Error(`${weatherRequest.status}`);
    }

    const errorLocation = document.querySelector('#error-location');
    errorLocation.style.visibility = 'hidden';

    const weatherData = await weatherRequest.json();
    return weatherData;
  } catch (error) {
    const errorLocation = document.querySelector('#error-location');
    errorLocation.style.visibility = 'visible';
    console.log(error);
    return Promise.reject(error);
  }
}

function createHourlyWeatherCard(hourData) {
  const weatherCard = document.createElement('div');
  weatherCard.classList.add('weatherCard');

  const weatherDate = new Date(hourData.time);
  const formattedTime = weatherDate.toLocaleString('en-US', {
    hour: 'numeric',
    hour12: true,
  });

  const weatherTime = document.createElement('p');
  weatherTime.innerHTML = `${formattedTime}`;

  const weatherIcon = document.createElement('img');
  weatherIcon.src = hourData.condition.icon;

  const weatherTemperature = document.createElement('p');
  weatherTemperature.innerHTML = `${hourData.temp_c}°`;

  weatherCard.append(weatherTime, weatherIcon, weatherTemperature);
  return weatherCard;
}

function createFutureWeatherCard(data) {
  const weatherCard = document.createElement('div');
  weatherCard.classList.add('weatherCard');

  const [year, month, day] = [...data.date.split('-')];
  const weatherDate = new Date(year, month - 1, day);
  const formattedTime = weatherDate.toLocaleString('en-US', {
    weekday: 'long',
  });

  const weatherTime = document.createElement('p');
  weatherTime.innerHTML = formattedTime;

  const weatherIcon = document.createElement('img');
  weatherIcon.src = data.day.condition.icon;

  const weatherTemperature = document.createElement('p');
  weatherTemperature.innerHTML = `${data.day.avgtemp_c}°`;

  weatherCard.append(weatherTime, weatherIcon, weatherTemperature);
  return weatherCard;
}

function displayFutureForecast(data) {
  const futureContainer = document.querySelector('.future-forecast-container');
  futureContainer.innerHTML = '<h3 class=section-title>Future Forecast<h3>';
  for (let i = 0; i < 3; i++) {
    const dayData = data.forecast.forecastday[i];
    const weatherCard = createFutureWeatherCard(dayData);

    if (i === 0) {
      const day = weatherCard.querySelector('p');
      day.innerHTML = 'Today';
    }

    futureContainer.append(weatherCard);
  }
}

function displayHourlyForecast(data) {
  const todayHourlyData = data.forecast.forecastday[0].hour;
  const todayDate = new Date();
  const currentHour = todayDate.getHours();
  const hourlyWeatherContainer = document.querySelector(
    '.hourly-weather-container'
  );
  hourlyWeatherContainer.innerHTML =
    '<h3 class=section-title>Hourly Forecast<h3>';
  let cardsRemaining = 6;
  for (
    let i = currentHour;
    i < todayHourlyData.length && cardsRemaining !== 0;
    i++
  ) {
    const hourData = todayHourlyData[i];
    const weatherCard = createHourlyWeatherCard(hourData);
    hourlyWeatherContainer.append(weatherCard);
    cardsRemaining--;
  }

  if (cardsRemaining !== 0) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwHourlyData = data.forecast.forecastday[0].hour;

    for (let i = 0; i < cardsRemaining; i++) {
      const hourData = tmrwHourlyData[i];
      const weatherCard = createHourlyWeatherCard(hourData);
      hourlyWeatherContainer.append(weatherCard);
    }
  }
}

async function displayCurrentWeather(loc) {
  const locationInput = document.querySelector('#locationInput');
  let location = locationInput.value;
  if (loc != null) {
    location = loc;
  }

  try {
    const weatherData = await fetchWeatherData(location);
    const weatherCard = document.createElement('div');
    weatherCard.classList.add('weatherCard');

    const weatherCardHeader = document.createElement('h2');
    weatherCardHeader.innerHTML = weatherData.location.name;

    const weatherIcon = document.createElement('img');
    weatherIcon.src = weatherData.current.condition.icon;

    const weatherCondition = document.createElement('p');
    weatherCondition.innerHTML = `${weatherData.current.condition.text}`;

    const weatherTemperature = document.createElement('p');
    weatherTemperature.innerHTML = `${weatherData.current.temp_c}°`;

    const minTemperature = document.createElement('p');
    minTemperature.innerHTML = `L:${weatherData.forecast.forecastday[0].day.mintemp_c}°`;

    const maxTemperature = document.createElement('p');
    maxTemperature.innerHTML = `H:${weatherData.forecast.forecastday[0].day.maxtemp_c}°`;

    const temperatureContainer = document.createElement('div');
    temperatureContainer.classList.add('temperature-container');
    temperatureContainer.append(maxTemperature, minTemperature);

    const windSpeed = document.createElement('p');
    windSpeed.innerHTML = `${weatherData.forecast.forecastday[0].day.maxwind_kph}km/h`;
    const wind = document.createElement('p');
    wind.innerHTML = 'Wind';
    const windImage = new Image();
    windImage.classList.add('icon');
    windImage.src = Wind;

    const windContainer = document.createElement('div');
    windContainer.append(windImage, windSpeed, wind);

    const chanceOfRain = document.createElement('p');
    chanceOfRain.innerHTML = `${weatherData.forecast.forecastday[0].day.daily_chance_of_rain}%`;
    const rain = document.createElement('p');
    rain.innerHTML = 'Rain';
    const rainImage = new Image();
    rainImage.classList.add('icon');
    rainImage.src = Rain;

    const rainContainer = document.createElement('div');
    rainContainer.append(rainImage, chanceOfRain, rain);

    const humidityPercent = document.createElement('p');
    humidityPercent.innerHTML = `${weatherData.forecast.forecastday[0].day.avghumidity}%`;
    const humidity = document.createElement('p');
    humidity.innerHTML = 'Humidity';
    const humidityImage = new Image();
    humidityImage.classList.add('icon');
    humidityImage.src = Humidity;

    const humidityContainer = document.createElement('div');
    humidityContainer.append(humidityImage, humidityPercent, humidity);

    const detailContainer = document.createElement('div');
    detailContainer.append(windContainer, rainContainer, humidityContainer);
    detailContainer.classList.add('detail-container');

    weatherCard.append(
      weatherCardHeader,
      weatherIcon,
      weatherCondition,
      weatherTemperature,
      temperatureContainer,
      detailContainer
    );

    const currentWeatherContainer = document.querySelector(
      '.current-weather-container'
    );
    currentWeatherContainer.innerHTML = '';
    currentWeatherContainer.append(weatherCard);

    displayHourlyForecast(weatherData);
    displayFutureForecast(weatherData);
  } catch (error) {
    console.log(error);
  }
}

const weatherLocationForm = document.querySelector('#weatherLocationForm');
weatherLocationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  displayCurrentWeather();
});

displayCurrentWeather('London');
