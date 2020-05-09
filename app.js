$(document).ready(function () {
    var $currentDate = $("#currentDate");
    var $currentTemp = $("#currentTemp");
    var $currentCity = $("#currentCity");
    var $weatherIcon = $("#weatherIcon");
    var $weatherStats = $("#weatherStats");

    var searchCity;
    var temp;
    var currentIcon;
    var description;
    var hourly = [];
    var sevenDay = [];
    var sevenDayIcon = [];

    //get current location
    $("input").on("keydown",function search(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            searchCity = $(this).val();
            $currentCity.html(`<h1>${searchCity}</h1>`)
            getCurrentWeather(searchCity);
        }
    });

    function getCurrentWeather(city) {
        $.ajax({
            type: "GET",
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c64d3ff6b9a9c58c72a6b260cf9dc8e7`,
            data: 'json',
        }).then(function (res) {
            console.log(res);
            temp = res.main.feels_like;
            currentIcon = res.weather[0].icon;
            description = res.weather[0].description;
            currentTemp(temp);
        });
    }

    //init current temp
    function currentTemp(temp) {
        temp = Math.floor(convertFahrenheit(temp));
        renderWeather();
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
        $currentTemp.html(`<h1>${temp}\u00B0F</h1><p>${description}</p>`);
        $weatherIcon.html(`<img src="http://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="weather icon">`);
    }
});