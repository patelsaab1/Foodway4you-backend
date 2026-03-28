import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const calculateDeliveryDistance = async (restaurantCoords, customerCoords) => {
  try {
    const response = await client.distancematrix({
      params: {
        origins: [restaurantCoords],           // [latitude, longitude] or "lat,lng" string
        destinations: [customerCoords],
        mode: 'driving',                       // or 'driving' is best for delivery
        units: 'metric',                       // returns km
        key: GOOGLE_API_KEY,
      },
    });

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new Error(`Distance calculation failed: ${element.status}`);
    }

    const distanceInMeters = element.distance.value;
    const distanceInKm = (distanceInMeters / 1000).toFixed(2);
    const durationInSeconds = element.duration.value; // in seconds

    return {
      distanceKm: parseFloat(distanceInKm),
      distanceText: element.distance.text,      // e.g., "6.8 km"
      durationMinutes: Math.ceil(durationInSeconds / 60),
      durationText: element.duration.text
    };

  } catch (error) {
    console.error('Google Distance Matrix Error:', error.message);
    throw new Error('Failed to calculate delivery distance. Please try again.');
  }
};