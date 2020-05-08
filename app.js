$(document).ready(function () {
    var lat;
    var long;

    navigator.geolocation.getCurrentPosition(initLocation);

    //get current location
    function initLocation(position) {
        lat = position.coords.latitude;
        long = position.coords.longitude;
        console.log(lat);
        console.log(long);
        getCurrentWeather(lat, long);
    }   

    function getCurrentWeather(lat, long) {
        $.ajax({
            type: "GET",
            url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude={part}&appid=c64d3ff6b9a9c58c72a6b260cf9dc8e7`,
            data: 'json',
        }).then(function (res) {
            console.log(res);
        });
    }
    
});