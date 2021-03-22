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

    // Calculate sun angle for panel
    var angle = 0;
    var denom = 0;

    if (azimuth < 90.0) {
      denom = 90 - azimuth;
    } else if (azimuth < 180.0) {
      denom = azimuth - 90;
    } else if (azimuth < 270.0) {
      denom = 270 - azimuth;
    } else {
      denom = azimuth - 270;
    }

    angle = Math.atan( Math.tan(altitude*Math.PI/180) / Math.cos(denom*Math.PI/180) ) * 180/Math.PI;

    result = { angle: angle };

  } catch (error) {
    console.error(error);
  }

  return (result);

}

module.exports = { getPosition };
