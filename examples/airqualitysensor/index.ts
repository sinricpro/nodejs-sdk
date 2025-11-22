/**
 * SinricPro Air Quality Sensor Example
 *
 * Demonstrates:
 * - Sending air quality measurements (PM1, PM2.5, PM10, AQI)
 * - Sending temperature and humidity readings
 * - Periodic sensor data updates
 */

import SinricPro from 'sinricpro-sdk';
import { SinricProAirQualitySensor } from 'sinricpro-sdk';
import { SinricProSdkLogger, LogLevel } from 'sinricpro-sdk';

const DEVICE_ID = 'YOUR-DEVICE-ID'; // 24-character hex
const APP_KEY = 'YOUR-APP-KEY'; // UUID format
const APP_SECRET = 'YOUR-APP-SECRET'; // Long secret key

// Simulated sensor data
function getAirQualityData() {
  return {
    pm1: Math.floor(Math.random() * 50), // 0-50 µg/m³
    pm2_5: Math.floor(Math.random() * 100), // 0-100 µg/m³
    pm10: Math.floor(Math.random() * 150), // 0-150 µg/m³
    aqi: Math.floor(Math.random() * 200), // 0-200 AQI
  };
}

function getTemperatureData() {
  return {
    temperature: 20 + Math.random() * 10, // 20-30°C
    humidity: 40 + Math.random() * 30, // 40-70%
  };
}

async function main() {
  SinricProSdkLogger.setLevel(LogLevel.ERROR);

  console.log('='.repeat(60));
  console.log('SinricPro Air Quality Sensor Example');
  console.log('='.repeat(60));

  // Create air quality sensor device
  const sensor = SinricProAirQualitySensor(DEVICE_ID);

  // Add device to SinricPro
  SinricPro.add(sensor);

  SinricPro.onConnected(() => {
    console.log('\n✓ Connected to SinricPro!');
    console.log('  Sensor will report air quality every 60 seconds\n');
  });

  // Initialize SinricPro
  await SinricPro.begin({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
  });

  // Send sensor data every 60 seconds
  setInterval(async () => {
    const airQuality = getAirQualityData();
    const temp = getTemperatureData();

    console.log(`[Air Quality] PM2.5: ${airQuality.pm2_5} µg/m³, AQI: ${airQuality.aqi}`);
    const success1 = await sensor.sendAirQualityEvent(airQuality);
    console.log(`  ${success1 ? '✓' : '✗'} Air quality event sent`);

    console.log(
      `[Temperature] ${temp.temperature.toFixed(1)}°C, Humidity: ${temp.humidity.toFixed(1)}%`
    );
    const success2 = await sensor.sendTemperatureEvent(temp.temperature, temp.humidity);
    console.log(`  ${success2 ? '✓' : '✗'} Temperature event sent\n`);
  }, 60000); // Every 60 seconds
}

process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await SinricPro.stop();
  process.exit(0);
});

main().catch(console.error);
