const axios = require('axios');
const moment = require('moment');

const testLat = 53.47;
const testLon = 2.300;

let lastReadISSDest;

let noClouds = [];
let nightTime = [];

const getISSFlyover = async (lat, lon) => {
  const result = await axios.get(`http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}`);
  return result.data;
}

const getWeather = async (lat, lon) => {
  const result = await axios.get(
    `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=a9b0c80e33b00616dd06e46354dc0c30`
  );
  return result.data.list;
}

const compareISSandWeather = (iss, weatherData) => {
  let results = [];
  iss.forEach((dest) => {
    const issTime = moment(dest.risetime * 1000).startOf('hour').toString();
    for(let weather of weatherData) {
      const weatherTime = moment(weather.dt * 1000).startOf('hour').toString();
      if (issTime == weatherTime) {
        dest.weather = weather;
        break;
      } else {
        dest.weather = lastReadISSDest.weather;
      }
    }
    lastReadISSDest = dest;
    results.push(dest);
  });
  return results;
};

getISSFlyover(testLat, testLon).then(async (data) => {
  const weather = await getWeather(testLat, testLon);
  const compared = compareISSandWeather(data.response, weather);

});

Promise.all([getISSFlyover(testLat, testLon), getWeather(testLat, testLon)]).then((data => {
  console.log(data[0]);
  const compared = compareISSandWeather(data[0], data[1]);
  compared.forEach((result) => {
    if(result.weather.clouds.all === 0) {
      noClouds.push(result);
    }
    if(result.weather.sys.pod == 'n') {
      nightTime.push(result);
    }
  });
  
  // console.log(nightTime.length);
  // console.log(noClouds.length);
}));

