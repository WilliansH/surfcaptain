'use strict'

const token = localStorage.getItem('accessToken');
const dataForecastSummary = localStorage.getItem('ForecastSummary');
const dataForecastCurrent = '{"errorMsg": false,"data": {"url_link": "https://surfcaptain.com/forecast/delaware","forecast_title": "Delaware","low_tide": "7:40pm","high_tide": "1:23pm","atmp": 43,"wind_dir": "SE","wind_spd": "11 &rarr; 16mph","buoy": "44089","buoy_data": "4.3 ft @ 12sec","sea_temp": 49,"wetsuit": "5/3, Boots/Gloves(5)","now_surf": "Surf conditions are 3-4+ ft and semiclean/textured right now"}}'
localStorage.setItem('ForecastCurrent', dataForecastCurrent);


function getToken() {

    const urlApi = 'https://api.surfcaptain.com/oauth/token';

    var formdata = new FormData();
    formdata.append("grant_type", "password");
    formdata.append("client_id", "14");
    formdata.append("client_secret", "yEtgO9liOKJI4IwlHqKyoduBAjFZKU2JBwcCGvr4");
    formdata.append("username", "damon@mototvnetwork.com");
    formdata.append("password", "TGk5!z*2fQ^ed3MI");

    return fetch(urlApi, {
        method: 'POST',
        body: formdata
    })
        .then(response => response.json())
        .then(data => {

            console.log(data)
            const token = data.access_token;
            localStorage.setItem('accessToken', token);
            console.log(token);
        })
        .catch(error => console.error(error));
}

function getAllLocation() {
    const urlApi = 'https://api.surfcaptain.com/api/forecast-locations';
    const authHeaders = {
        'Authorization': `Bearer ${token}`,
    };

    return fetch(urlApi, {
        method: 'GET',
        headers: authHeaders,
    })
        .then(response => response.json())
        .then(data => {
            const buscar = data.data;
            const DataArray = []
            let titleInfo;
            DataArray.push(buscar);
            DataArray.forEach(subArray => {
                subArray.forEach(element => {
                    if (element.state === "DE") {
                        titleInfo = element;
                        let title = document.querySelector('#title')
                        title.innerHTML = titleInfo.name + "," + " " + titleInfo.state + " Surf Report";
                    }
                })
            })
            console.log(titleInfo)
        })
        .catch(error => console.error(error));
}
getAllLocation();

function getForecastSummary() {
    const urlApi = 'https://plt-temporary-storage.s3.amazonaws.com/surf-captain/forecast-summary.json';
    return fetch(urlApi, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            const dataForecastSummary = data;
            localStorage.setItem('ForecastSummary', dataForecastSummary);
            const status = document.querySelector('#dot');
            if (dataForecastSummary.data.forecast_days[0].am_cond === "clean") {
                status.style.background = "green"
            }
            console.log("Summary", dataForecastSummary);
        })
        .catch(error => console.error(error));
}
getForecastSummary();



function getForecastCurrent() {

    const jsonDataCurrent = JSON.parse(dataForecastCurrent);
    console.log("Current", jsonDataCurrent);
    let condition = document.querySelector('#header-text')
    let temp = document.querySelector('#weather-info')
    let lowHigh = document.querySelector('#low-high-info')
    let buoyNumber = document.querySelector('#buoy-number')
    let buoyInfo = document.querySelector('#buoy-info')
    let waterInfo = document.querySelector('#water-info')

    waterInfo.innerHTML = jsonDataCurrent.data.sea_temp + "°" + "  " + jsonDataCurrent.data.wetsuit;
    buoyInfo.innerHTML = jsonDataCurrent.data.buoy_data;
    buoyNumber.innerHTML = "BUOY" + " " + jsonDataCurrent.data.buoy;
    lowHigh.innerHTML = jsonDataCurrent.data.low_tide + "  " + jsonDataCurrent.data.high_tide;
    condition.innerHTML = jsonDataCurrent.data.now_surf;
    temp.innerHTML = jsonDataCurrent.data.atmp + "°" + " " + jsonDataCurrent.data.wind_spd;

}
getForecastCurrent();






