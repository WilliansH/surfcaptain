'use strict'
window.addEventListener('DOMContentLoaded', ready);

//time data
var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;

//auth token
const token = localStorage.getItem('accessToken');

//data from local storage
const dataSlugs = localStorage.getItem('Slug');
const dataForecastSummary = localStorage.getItem('Summary');
const dataForecastCurrent = localStorage.getItem('Current');
const timeString = localStorage.getItem('lastTimeFetch');
const lastTimeFetch = new Date(parseInt(timeString));
var slug = getParameterByName("slug");
const oldSlug = localStorage.getItem('oldSlug');

function ready() {
    getToken();
    if (ensureParams()) {
        if (didRecentlyFetch() && doesExistSlug()) {
            let current = JSON.parse(localStorage.getItem('Current'))
            let summary = JSON.parse(localStorage.getItem('Summary'))
            renderCurrent(current);
            renderSummary(summary);

        } else {
            fetchData();
        }
    } else {
        console.error("No slug was provided in the slug parameter.");
    }
}

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
            const token = data.access_token;
            localStorage.setItem('accessToken', token);
        })
        .catch(error => console.error(error));
}

function fetchData() {
    const urlApiSummary = `https://api.surfcaptain.com/api/forecast-summary?slug=${slug}`;
    const urlApiCurrent = `https://api.surfcaptain.com/api/forecast-current?slug=${slug}`;
    const authHeaders = {
        'Authorization': `Bearer ${token}`,
    };
    Promise.all([
        fetch(urlApiCurrent, {
            method: 'GET',
            headers: authHeaders,
        })
            .then(response => response.json())
            .then(data => {
                alert('funca')
                let dataCurrent = data.data;
                if (data.error) {
                    alert('An error has occurred, please verify the url is correct.');
                }
                parseDataCurrent(dataCurrent);
            })
            .catch(error => console.error(error)),
        fetch(urlApiSummary, {
            method: 'GET',
            headers: authHeaders,
        })
            .then(response => response.json())
            .then(data => {
                let dataSummary = data.data
                if (data.error) {
                    alert('An error has occurred, please verify the url is correct.');
                }
                parseDataSummary(dataSummary);
            })
            .then(results => {
                localStorage.setItem('lastTimeFetch', (new Date).getTime());
            })
            .catch(error => console.error(error))
    ])
        .catch(error => console.error(error));
}


function parseDataCurrent(dataCurrent) {
    alert('pdc')
    if (dataCurrent.error) {
        alert('An error hadataCurrents occurred, please verify the url is correct.');
    } else {
        const currentData = JSON.parse(localStorage.getItem('Current')) || {};
        const newDataCurrent = { ...currentData, ...dataCurrent };
        localStorage.setItem('Current', JSON.stringify(newDataCurrent));
        renderCurrent(newDataCurrent);
    }
}

function parseDataSummary(dataSummary) {

    if (dataSummary.error) {
        alert('An error has occurred, please verify the url is correct.');
    } else {
        const summaryData = JSON.parse(localStorage.getItem('Summary')) || {};
        const newDataSummary = { ...summaryData, ...dataSummary };
        localStorage.setItem('Summary', JSON.stringify(newDataSummary));
        renderSummary(newDataSummary);
    }
}
function setDotColor(dataForecastSummary) {

    const conditions_color = {
        clean: 'green',
        choppy: 'red',
        fair: 'blue'
    }
    let hour = new Date().getHours();
    let meridiem
    if (hour >= 12) {
        meridiem = 'pm_cond'
    } else {
        meridiem = 'am_cond'
    }
    let condition = dataForecastSummary.forecast_days[0][meridiem]
    let color = conditions_color[condition]

    document.querySelector('#dot').classList.add(color + '-dot')
}

function renderSummary(dataForecastSummary) {
    document.querySelector('#widget-title').innerHTML = dataForecastSummary.forecast_title
    setDotColor(dataForecastSummary)
    let icon_name = dataForecastSummary.forecast_days[0].wx_icon
    document.querySelector('#weather-icon').src = images[icon_name]

}

function renderCurrent(dataForecastCurrent) {

    let subtitle = document.querySelector('#widget-subtitle')
    subtitle.innerHTML = dataForecastCurrent.now_surf
    subtitle.href = dataForecastCurrent.url_link

    document.querySelector('#weather').innerHTML = dataForecastCurrent.atmp + 'º ' + dataForecastCurrent.wind_spd
    document.querySelector('#tide').innerHTML = dataForecastCurrent.low_tide + ' ' + dataForecastCurrent.high_tide
    document.querySelector('#buoy-title').innerHTML = dataForecastCurrent.buoy
    document.querySelector('#buoy-data').innerHTML = dataForecastCurrent.buoy_data
    document.querySelector('#w-temp').innerHTML = dataForecastCurrent.sea_temp + ' ' + dataForecastCurrent.wetsuit

}


function ensureParams(slugParams) {
    if (!getSlugString()) {
        return false
    } else {
        return true
    }
}

function didRecentlyFetch() {
    var now = new Date().getTime();
    var lastFetch = lastTimeFetch;
    // The last fetch was within the last hour
    return lastFetch && now - HOUR < lastFetch && lastFetch <= now;
}


function getSlugString() {
    localStorage.setItem('oldSlug', slug);
    return slug;
}

function doesExistSlug() {
    let newSlug = getSlugString();
    if (newSlug === oldSlug)
        return true
}

function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return '';
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getLocalStorageTimestampKey() {
    return 'weather-widget-TIMEOUT-' + getSlugString();
}


