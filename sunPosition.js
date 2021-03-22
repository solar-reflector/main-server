const axios = require('axios');

async function getPosition() {

  var result = "Incorrect data";

  try {
    const response = await axios.get('https://api.ipgeolocation.io/astronomy?apiKey=77402b6972ba45989c4d64972a11f8a8&lat=45.9636&long=-66.6431');
    //const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    //console.log('Date in Response header:', headerDate);
    const json = response.data;

    // Get Altitude
    var altitude = json.sun_altitude;

    // Get Azimuth
    var azimuth = json.sun_azimuth;

    result = { altitude: altitude, azimuth: azimuth };

  } catch (error) {
    console.error(error);
  }

  return (result);

}

module.exports = { getPosition };
