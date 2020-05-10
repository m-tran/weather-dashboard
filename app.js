$(document).ready(function () {
    var $currentDate = $("#currentDate");
    var $currentTemp = $("#currentTemp");
    var $currentCity = $("#currentCity");
    var $weatherIcon = $("#weatherIcon");
    var $weatherStats = $("#weatherStats");
    var $fiveDayForecast = $("#fiveDayForecast");
    var $previousLocations = $("#previousLocations");

    //openweather
    var apiKey = "c64d3ff6b9a9c58c72a6b260cf9dc8e7";
    //weather bit
    var apiKeyWeather = "8ceee45a95b44ea2b66af380009622a6";
    //clima cell
    var apiKeyClima = "zWW09Dnm2gH8BZmajzjhuxznR1V2CtGu";

    var defaultCity = "San Francisco";

    var searchCity;
    var prevCity;
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

    var pastSearch = [];

    getCurrentWeather(defaultCity);
    $currentCity.html(`<h2>${defaultCity}</h2>`)

    //get current location
    $("input").on("keydown", function search(e) {
        if (e.keyCode == 13) {
            e.preventDefault();

            searchCity = $(this).val();
            $currentCity.html(`<h2>${searchCity}</h2>`);

            if (pastSearch.length <= 4 && pastSearch.length > 0) {
                console.log(pastSearch);
                console.log(pastSearch);
                console.log("run");
                $previousLocations.html("");
                for (let i=0; i < pastSearch.length; i++) {
                    $previousLocations.prepend(`<p class="past"><b>${pastSearch[i]}</b></p>`);
                }
                pastSearch.push(searchCity);
            } else if (pastSearch.length > 4) {
                pastSearch.shift();
                pastSearch.push(searchCity);
                $previousLocations.html("");
                for (let i=0; i < pastSearch.length; i++) {
                    $previousLocations.prepend(`<p class="past"><b>${pastSearch[i]}</b></p>`);
                }
            } else {
                $previousLocations.html("");
                pastSearch.push(searchCity);
            };

            getCurrentWeather(searchCity);

            $('input').val('');
        }
    });

    $(document).on("click", ".past", function() {
        console.log($(this).text());
        getCurrentWeather($(this).text());
        $currentCity.html(`<h2>${$(this).text()}</h2>`)
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
        }).then(function (res) {
            uv = res.value;
        });
    }

    //get hourly forecast
    function getHourly(city) {
        $.ajax({
            type: "GET",
            url: `https://api.climacell.co/v3/weather/forecast/hourly?lat=${lat}&lon=${lon}&unit_system=si&start_time=now&fields=temp&apikey=${apiKeyClima}`,
        }).then(function (res) {
            
            hourly = [];
            hourlyTemp = [];

            for (let i = 0; i < 24; i = i + 2) {
                hourly.push(moment(res[i].observation_time.value).format("hh A"));
                hourlyTemp.push(Math.floor(convertToF(res[i].temp.value)));
            }

            var ctx = $("#hourlyChart");

            var plugin = [ChartDataLabels];

            var chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'bar',
                plugins: [ChartDataLabels],

                // The data for our dataset
                data: {
                    labels: hourly,
                    datasets: [{
                        label: 'Temperature\u00B0F',
                        backgroundColor: 'rgb(255, 240, 164)',
                        borderColor: 'rgb(255,184,0)',
                        borderWidth: 2,
                        data: hourlyTemp,
                        barThickness: "25px",
                        borderSkipped: false,
                    }]
                },

                // Configuration options go here
                options: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 0,
                        }
                    },
                    tooltips: {
                        enabled: false
                    },
                    plugins: {
                        datalabels: {
                            align: 'end',
                            anchor: 'end',        
                            backgroundColor: '#ffffff',
                            borderRadius: 4,
                            color: '#a3a3a3',
                            formatter: Math.round
                        }
                    },
                    responsive: true,

                    maintainAspectRatio: false,
                    
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display:false,
                                drawBorder: false,
                            },
                            barPercentage: 0.4
                        }],
                        yAxes: [{
                            gridLines: {
                                display:false,
                                drawBorder: false,
                            },
                            ticks: {
                                display: false,
                                suggestedMin: 20, 
                            }  
                        }]
                    }
                }
            });
        });
    }

    //get 5-day forecast
    function getForecast(city) {
        $.ajax({
            type: "GET",
            url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`,
            data: "json",
        }).then(function (res) {
            fiveDay = [];
            fiveDayDate = [];
            fiveDayHumidity = [];
            fiveDayIcon = [];
            fiveDayTemp = [];
            for (let i = 0; i < res.list.length; i++) {
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

    // convert C to F
    function convertToF(temp) {
        temp = temp * 9/5 + 32
        return temp;
    }

    //render current weather
    function renderWeather() {
        $currentDate.html(`<p>${moment().format("dddd, MMMM Do")} <br> <b>${moment().format("h:mm A")}</b></p>`);
        $currentTemp.html(`<h1>${dayTemp}\u00B0F</h1><p>${description}</p>`);
        $weatherIcon.html(`<img src="http://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="weather icon">`);

        var uvConditions;
        if (uv > 5) {
            uvConditions = `<p>UV Index &nbsp|&nbsp  <span class="red">&nbsp<b>${uv}</b>&nbsp</span></p>`;
        } else if (uv <=5 && uv >=3) {
            uvConditions = `<p>UV Index &nbsp|&nbsp <span class="yellow">&nbsp<b>${uv}</b>&nbsp</span></p>`;
        } else {
            uvConditions = `<p>UV Index &nbsp|&nbsp  <span class="green">&nbsp<b>${uv}</b>&nbsp</span></p>`;
        };

        $weatherStats.html(`<p>Humidity &nbsp|&nbsp  <b>${humidity}%</b></p><p>Wind Speed &nbsp|&nbsp  <b>${windSpeed}</b> mph</p>${uvConditions}`);

        $fiveDayForecast.html("");

        for (let i = 0; i < fiveDay.length; i++) {
            $fiveDayForecast.append(`
                <div class="card">
                    <div class="card-body">
                        <p>${moment(fiveDayDate[i]).format("dddd")}</p>
                        <img src="http://openweathermap.org/img/wn/${fiveDayIcon[i]}@2x.png" alt="weather icon">
                        <h1>${fiveDayTemp[i]}\u00B0F</h1>
                        <p>Humidity &nbsp|&nbsp <b>${fiveDayHumidity[i]}%</b></p>
                    </div>
                </div>
            `)
        }
    }
});

