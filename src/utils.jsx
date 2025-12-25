import axios from "axios";

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function fetchGeoLocationDetail(latitude, longitude) {
  const response = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
  );
  const {
    city = "",
    town = "",
    village = "",
    country = "",
    amenity = "",
  } = response.data.address || {};
  return { city, town, village, country, amenity };
}

export function parseLocation(locationStr) {
  const [latitude, longitude] = locationStr
    .split(",")
    .map((x) => Number(x).toFixed(7));
  return { latitude, longitude };
}
