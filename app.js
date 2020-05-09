$(document).ready(function () {
    var $currentDate = $("#currentDate");
    var $currentTemp = $("#currentTemp");
    var $currentCity = $("#currentCity");
    var $weatherIcon = $("#weatherIcon");
    var $weatherStats = $("#weatherStats");
    var $fiveDayForecast = $("#fiveDayForecast");

    //openweather
    var apiKey = "c64d3ff6b9a9c58c72a6b260cf9dc8e7";
    //weather bit
    var apiKeyWeather = "8ceee45a95b44ea2b66af380009622a6";
    //clima cell
    var apiKeyClima = "zWW09Dnm2gH8BZmajzjhuxznR1V2CtGu";

    var searchCity;
    var lat;
    var lon;

    var dayTemp;
    var currentIcon;
    var description;

    var windSpeed;
    var uv;
    var humidity;

    var hourly = [];
    var hourlyTemp = [];
    
    var fiveDay = [];
    var fiveDayIcon = [];
    var fiveDayDate = [];
    var fiveDayTemp = [];
    var fiveDayHumidity = [];

    //get current location
    $("input").on("keydown",function search(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            searchCity = $(this).val();
            $currentCity.html(`<h1>${searchCity}</h1>`)
            getCurrentWeather(searchCity);
        }
    });

    //get current weather
    function getCurrentWeather(city) {
        $.ajax({
            type: "GET",
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`,
            data: 'json',
        }).then(function (res) {
            console.log(res);
            dayTemp = res.main.feels_like;
            currentIcon = res.weather[0].icon;
            description = res.weather[0].description;
            windSpeed = res.wind.speed;
            humidity = res.main.humidity;
            lat = res.coord.lat;
            lon = res.coord.lon;
            getUV(city);
            currentTemp(dayTemp);
            getHourly(city);
            getForecast(city);   
        });
    }

    //get current UV
    function getUV(city) {
        $.ajax({
            type: "GET",
            url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`,
        }).then(function (res){
            uv = res.value;
        });
    }

    //get hourly forecast
    function getHourly(city) {
        $.ajax({
            type: "GET",
            url: `https://api.climacell.co/v3/weather/forecast/hourly?lat=${lat}&lon=${lon}&unit_system=si&start_time=now&fields=temp&apikey=${apiKeyClima}`,
        }).then(function (res) {
            console.log(res);
            console.log(moment(res[0].observation_time.value).format("hh A"));
            for (let i=0; i < 24; i=i+2) {
                hourly.push(moment(res[i].observation_time.value).format("hh A"));
                hourlyTemp.push(res[i].temp.value);
            }
            console.log(hourly);
            console.log(hourlyTemp);
        });
    }

    //get 5-day forecast
    function getForecast(city) {
        $.ajax({
            type: "GET",
            url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`,
            data: "json",
        }).then(function (res) {
            for (let i=0; i < res.list.length; i++) {
                if (res.list[i].dt_txt.includes("12:00:00")) {
                    fiveDay.push(res.list[i]);
                    fiveDayDate.push(res.list[i].dt_txt);
                    fiveDayHumidity.push(res.list[i].main.humidity);
                    fiveDayIcon.push(res.list[i].weather[0].icon.replace("n", "d"));
                    fiveDayTemp.push(currentTemp(res.list[i].main.feels_like));
                };
            }
            renderWeather();   
        });
    }

    //init current temp
    function currentTemp(temp) {
        temp = Math.floor(convertFahrenheit(temp));
        return temp;
    }

    //convert to F
    function convertFahrenheit(temp) {
        temp = ((temp - 273.15) * 1.8) + 32;
        return temp;
    }

    //convert to C
    function convertCelsius(temp) {
        temp = temp - 273.15;
        return temp;
    }

    //render current weather
    function renderWeather() {
        $currentDate.html(`<p>${moment().format("dddd, MMMM Do")}</p><p>${moment().format("h:m A")}</p>`);
        $currentTemp.html(`<h1>${dayTemp}\u00B0F</h1><p>${description}</p>`);
        $weatherIcon.html(`<img src="http://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="weather icon">`);
        $weatherStats.html(`<p>Humidity: ${humidity}</p><p>Wind Speed: ${windSpeed}</p><p>UV Index: ${uv}</p>`);

        console.log(fiveDayHumidity);

        for (let i=0; i < fiveDay.length; i++) {
            $fiveDayForecast.append(`
                <div class="card">
                    <div class="card-body">
                        <p>${moment(fiveDayDate[i]).format("dddd")}</p>
                        <img src="http://openweathermap.org/img/wn/${fiveDayIcon[i]}@2x.png" alt="weather icon">
                        <h1>${fiveDayTemp[i]}</h1>
                        <p>Humidity: ${fiveDayHumidity[i]}</p>
                    </div>
                </div>
            `)
        }
    }
});