var weatherApp = angular.module('weatherApp', ['ngMap'])
    .controller('weatherCtrl', function ($http) {
        //--- starup code
        var vm = this;
        vm.temperatureUnit = 'F';
        initAutocompletePlaces();

        //step 1 - get current location
        $http({method: 'GET', url: ENDP_LOCATION}).then(function successCallback(location) {
            console.log("===> Location data:"); console.log(location);
            vm.loc = location.data;
            vm.lat = vm.loc.latitude;
            vm.lon = vm.loc.longitude;
            vm.addr = vm.loc.city + ", " + vm.loc.region_name + " " + vm.loc.country_name;
            vm.mapCenter = "[" + vm.lat + "," + vm.lon + "]";
            if (location.data.city === "") {
                console.log("Can not find city, this device may not have location sensor. Use my home Cupertino as address");
                vm.addr = "Cupertino, CA, United States";
                vm.loc.city = "Cupertino, CA";
            }
            var url_weather = ENDP_WEATHER + KEY_WEATHER + '&q=' + vm.loc.city;

            //step 2 - get current weather
            $http({method: 'GET', url: url_weather}).then(function successCallback(data2) {
                console.log("===> Weather data:"); console.log(data2);
                vm.weatherDetail = data2.data.current;
                vm.curTemp = vm.weatherDetail.temp_f;
                //display different background, weather icon..etc based type of weather
                changeBackground();
                requestFlag(false, vm.loc.country_code);
            }, function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });

        //---request weather again
        vm.requestWeatherForEntry = function () {
            var url_weather = ENDP_WEATHER + KEY_WEATHER + '&q=' + vm.locEntry;
            $http({method: 'GET', url: url_weather}).then(function successCallback(data2) {
                console.log("===> Weather data:"); console.log(data2);
                vm.weatherDetail = data2.data.current;
                vm.curTemp = vm.weatherDetail.temp_f;
                vm.temperatureUnit = 'F';//default Fahrenheit
                vm.loc = data2.data.location;
                vm.lat = vm.loc.lat;
                vm.lon = vm.loc.lon;
                vm.addr = vm.loc.name + ", " + vm.loc.region + " " + vm.loc.country;
                vm.mapCenter = "[" + vm.lat + "," + vm.lon + "]";
                requestFlag(true, vm.loc.country);
                $('input:text:first').focus();
                vm.locEntry = "";//clear field
                changeBackground();
            }, function (err) {
                console.log(err);
            })
        };

        //---toggle between celcius and fahrenheit
        vm.toggleCF = function () {
            if (vm.temperatureUnit == 'C') {
                vm.temperatureUnit = 'F'; vm.curTemp = vm.weatherDetail.temp_f;
            }
            else {
                vm.temperatureUnit = 'C'; vm.curTemp = vm.weatherDetail.temp_c;
            }
        };

        //---refresh background based on current weather condition text
        function changeBackground() {
            switch (vm.weatherDetail.condition.text) {
                case 'clear sky': {
                    vm.appBkgnd = {
                        "background": "url('https://source.unsplash.com/PcsNgTLkiS8')",
                        "background-size": "cover"
                    };
                    break;
                }
                case 'Partly cloudy': {
                    vm.appBkgnd = {
                        "background": "url('https://source.unsplash.com/0NtTrIodzuw')",
                        "background-size": "cover"
                    };
                    break;
                }
                case 'Overcast': {
                    vm.appBkgnd = {
                        "background": "url('https://source.unsplash.com/7msOkU56-5M')",
                        "background-size": "cover"
                    };
                    break;
                }
                case 'Light rain': {
                    vm.appBkgnd = {
                        "background": "url('https://source.unsplash.com/uFomxGheuGk')",
                        "background-size": "cover"
                    };
                    break;
                }
                case 'Sunny': {
                    vm.appBkgnd = {
                        "background": "url('https://source.unsplash.com/f3s9JUjahhs')",
                        "background-size": "cover"
                    };
                    break;
                }
                case 'Clear': {
                    vm.appBkgnd = {
                        "background": "url('https://source.unsplash.com/uivWDK2Ifrg')",
                        "background-size": "cover"
                    };
                    break;
                }
                default:
                    vm.appBkgnd = {
                        "background": "url('https://source.unsplash.com/5477L9Z5eqI')", "background-size": "cover"
                    };
                    break;
            }
        }

        //---request for country information (mainly just flag)
        //  use_name = true, search by name, false, search by country code
        function requestFlag(use_name, country) {
            var url = ENDP_COUNTRY_CODE_INFO + country;
            if (use_name)
                url = ENDP_COUNTRY_NAME_INFO + country;
            $http.get(url).then(function (payload) {
                console.log("===> Country data:"); console.log(payload.data);
                if (!use_name)
                    vm.countryFlag = payload.data.flag;
                else
                    vm.countryFlag = payload.data[0].flag;
            }, function (err) {
                console.log(err);
            })
        }

        //---initialize autocomplete from Google Places - somehow, this works with angular controller magically
        //  even though it goes to DOM directly
        function initAutocompletePlaces() {
            var ac_cmp = document.getElementById('AUTO-COMPLETE');
            var autoComplete = new google.maps.places.Autocomplete(ac_cmp, {types: ['geocode']});
            autoComplete.addListener('place_changed', function () {
                var place = autoComplete.getPlace();
                vm.currentAddress = place.formatted_address;
                console.log(place);
                if (place.photos === null || place.photos === undefined) {
                    console.log("No photo available for " + vm.currentAddress);
                    return;
                }
//TODO get photos ?????
                for (var idx=0; idx < place.photos.length; idx++) {
                    // var addr = place.photos[idx].getUrl();
                    var elem = place.photos[idx].html_attributions[0];
                    // console.log(elem);
                }
            });
        }
    }
);
$(document).ready(function () {//force first input text box input focus
    $('input:text:first').focus();
    // $('#CITY-NAME').focus();//TODO this doesn't work
});
//---constants
const ENDP_LOCATION = "https://freegeoip.net/json/";
const ENDP_WEATHER = "https://api.apixu.com/v1/current.json?key=";
const ENDP_COUNTRY_CODE_INFO = "https://restcountries.eu/rest/v2/alpha/";
const ENDP_COUNTRY_NAME_INFO = "https://restcountries.eu/rest/v2/name/";

const KEY_WEATHER = "9e450fc4750d4ab0b35215759171103";