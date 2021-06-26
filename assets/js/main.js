$(function() {

    let searchNamesArray = [];
    let cardParentDiv = $("div.card-row");
    let dateCardCnt = 0;

    //fetchForecastData
    //returns data from openweather api in json format
    let fetchForecastData = city =>{
        const apiKey = "1602cf34096adba596dbd657831f5ce9";
        let queryURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&cnt=65&appid=${apiKey}`;
        
        fetch(queryURL)
        .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayForecastData(data);
            });
        } else {
            //this would be a modal dialog rather than console log
            console.log('Not OK: ' + response.statusText);
        }
        })
            .catch(function (error) {
            console.log(error);
        });
    }

    //displayForecastData
    //mashup layer over display of today's weather and
    //display of 5 day forecast
    let displayForecastData = data => {
        displayWeatherToday(data);
        //displayForecastCards(data);
    }

    //displayWeatherToday
    //displays today's weather in main card
    let displayWeatherToday = data => {
        let citySpan = $("span#today-city");
        let dateSpan = $("span#today-date");
        let imgEl = $("img#header-icon");
        let tempSpan = $("span#today-temp");
        let windSpan = $("span#today-wind");
        let humSpan = $("span#today-humidity");
        let uvIndexSpan = $("span#today-uv-index");

        citySpan.text(data.city.name);
        dateSpan.text(moment(data.list[0].dt_txt.substring(0,10),"YYYY-MM-DD").format("M/D/YYYY"));
        tempSpan.text(data.list[0].main.temp + " F°");
        windSpan.text(data.list[0].wind.speed + " MPH");
        humSpan.text(data.list[0].main.humidity + "%");
        uvIndexSpan.text("33");

        let iconCode = data.list[0].weather[0].icon;
        imgEl.attr("src",`http://openweathermap.org/img/w/${iconCode}.png`);
    }

    //displayForecastCards
    //clears card row of previous cards and builds new row
    let displayForecastCards = data => {
        var cardDiv = document.getElementById("card-row"); 
    
        $('div.remove-card-div').remove()
         
        $(data.list).each(function(index) {
            buildForecastCard(index,this);
          });
          //reset counter, this only controls one output
          dateCardCnt = 0;
    }

    ///Only includes 9AM dates for now, easiest way to just
    //get 5 days out there
    let buildForecastCard = (index,input) => {
    
        let ulSavedCities =   $("#saved-search-cities");
        
        //we don't want the first one as that is the one we built our header
        //date with, then only take 9AM for now. do this more elegantly later
        //for now it works. 
        //TODO: Replace saved search cities card with column
        if(index>0 && input.dt_txt.includes("06:00:00") && dateCardCnt<5){
            dateCardCnt++;

            let cardDivEl = $("<div>")
                .addClass("col-10 col-md-4 col-lg-2 m-.5 bg-dark text-light remove-card-div");
            let h3El = $("<h3>");
            let imgEl = $("<img>");
            let pTempEL = $("<p>");
            let pWindEL = $("<p>");
            let pHumEL = $("<p>");

            h3El.text(moment(input.dt_txt.substring(0,10),"YYYY-MM-DD").format("M/D/YYYY"));

            let iconCode = input.weather[0].icon;
            imgEl.attr("src",`http://openweathermap.org/img/w/${iconCode}.png`);
            imgEl.attr("alt","weather icon");
            imgEl.attr("title","weather icon");
        
            pTempEL.text("Temp: " + input.main.temp + " F°");
            pWindEL.text("Wind: " + input.wind.speed + " MPH");
            pHumEL.text("Humidity: " + input.main.humidity + " %");

            //build structure
            cardDivEl.append(h3El);
            cardDivEl.append(imgEl);
            cardDivEl.append(pTempEL);
            cardDivEl.append(pWindEL);
            cardDivEl.append(pHumEL);
            cardParentDiv.append(cardDivEl);
        }
    }

    //saveSearchCity
    //saves previously search cities in list
    //TODO: Offer 'clear searches' button, or a button for each one to remove
    //from the list (that last one is better)
    let saveSearchCity = city => {
        const found = searchNamesArray.find(element => element === city);

        if(!found){
            searchNamesArray.push(city);
            let stringifiedArray = JSON.stringify(searchNamesArray);
            localStorage.setItem("stored-cities",stringifiedArray);
            console.log(stringifiedArray);
        }

        buildSavedSearchCityList();
    }

    //buildSavedSearchCityList
    //clears previous list and builds with new added search
    //if the city has not previously been added to the list
    let buildSavedSearchCityList = () => {
        let ulParentEl = $("ul#saved-search-cities");
        ulParentEl.empty();

        searchNamesArray = JSON.parse(localStorage.getItem("stored-cities"));
        searchNamesArray.sort();

        $(searchNamesArray).each(function(index,item){
            let liEl = $("<li>").attr("id",index);
            let buttonEl = $("<button>").attr("type","button").attr("data-search-city",item)
            buttonEl.addClass("btn btn-outline-success my-2 my-sm-0  saved-search-button");
            buttonEl.text(item);

            liEl.append(buttonEl);
            ulParentEl.append(liEl);
        });
      };

    //initialize main page elements
    let init = () => {

        let citySpan = $("span#today-city");
        let dateSpan = $("span#today-date");
        citySpan.text("Your city here")
        dateSpan.text(moment().format("M/D/YYYY"));

        //event delegation for saved search cities
        let containerDiv = $("div#saved-search-parent");
        containerDiv.on('click', '.saved-search-button', function (event) {
            let searchCity = $(this).attr("data-search-city");

            fetchForecastData(searchCity);
        });

        let searchButton = $("button.search-button");
        searchButton.on('click',function(event){
            let searchInput = $("input#search-input").val();
            fetchForecastData(searchInput);
            saveSearchCity(searchInput);
            $("input#search-input").val('')
        });

        let clearSearchButton = $("button.clear-search-button");
        clearSearchButton.on('click',function(event){
            let ulSearchList = $("ul#saved-search-cities");
            ulSearchList.empty();
            localStorage.setItem("stored-cities",""); 
            searchNamesArray.length = 0;
        });

        if(!localStorage.getItem("stored-cities")){
            storedSearchCities = localStorage.setItem("stored-cities",""); 
        }else{
            //repopulate the list on refresh
            buildSavedSearchCityList();
        }
    }

    init();
});







// $(function(){

//     //CLASSES
//     class GearItem{
//         constructor(index, name,type,usage,initials) {
//           this.index = index;
//           this.name = name;
//           this.type = type;
//           this.usage = usage;
//           this.initials = initials;
//         }
//       }

//     //do you have template outfits instead? I'd say you
//     //should, it would make the logic way easier
//     class RideOutfit{

//     }
//     //END CLASSES
//     let searchNamesArray = [];
//     let cardParentDiv = $("div.card-row");
//     let dateCardCnt = 0;

//     let fetchWeatherData = () => {
//         //preselect some cities; this could be customized by user
//         //let cities = ["Auckland", "Christchurch", "Dunedin", "Akaroa", "Kaikoura", "Wellington", "Invercargill"];
//         let cities = ["Reykjavik", "Selfoss", "Akureyri"];
//         const apiKey = "1602cf34096adba596dbd657831f5ce9";

//         for (i = 0; i < cities.length; i++) {
//             city = cities[i];

//             let queryURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&cnt=40&appid=${apiKey}`;
//             alert(queryURL);
//             fetch(queryURL,{
//                 method: 'GET', // *GET, POST, PUT, DELETE, etc.
//                 mode: 'same-origin', // no-cors, *cors, same-origin
//                 cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//                 credentials: 'same-origin', // include, *same-origin, omit
//                 headers: {
//                   'Content-Type': 'application/json'
//                   // 'Content-Type': 'application/x-www-form-urlencoded',
//                 }})
//                 .then(function (response) {
//                     if (response.ok) {
//                         response.json().then(function (data) {
//                             displayForecastData(data);
//                         });
//                     } else {
//                         //this would be a modal dialog rather than console log
//                         console.log('Not OK: ' + response.statusText);
//                     }
//                 })
//                 .catch(function (error) {
//                     alert(error);
//                 });
//         }
//     }

    // let fetchWeatherData = city => {
    //         const apiKey = "1602cf34096adba596dbd657831f5ce9";
    //         let queryURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&cnt=40&appid=${apiKey}`;
    //         alert(queryURL);

    //         fetch(queryURL)
    //             .then(function (response) {
    //                 if (response.ok) {
    //                     response.json().then(function (data) {
    //                         displayForecastData(data);
    //                     });
    //                 } else {
    //                     //this would be a modal dialog rather than console log
    //                     alert("Not ok");
    //                     console.log('Not OK: ' + response.statusText);
    //                 }
    //             })
    //             .catch(function (error) {
    //                 alert("Error: " + error);
    //                 console.log(error);
    //             });
    // }

//     //displayForecastData
//     //mashup layer over display of today's weather and
//     //display of 5 day forecast
//     let displayForecastData = data => {
//         displayWeatherToday(data);
//         //displayForecastCards(data);
//     }

//     //displayWeatherToday
//     //displays today's weather in main card
//     let displayWeatherToday = data => {
//         let citySpan = $("span#today-city");
//         let dateSpan = $("span#today-date");
//         let tempSpan = $("span#today-temp");
//         let windSpan = $("span#today-wind");
//         let imgEl = $("img#today-icon");
//         let humSpan = $("span#today-humidity");
//         let uvIndexSpan = $("span#today-uv-index");

//         alert("City: " + data.city.name);

//         citySpan.text(data.city.name);
//         dateSpan.text(moment(data.list[0].dt_txt.substring(0,10),"YYYY-MM-DD").format("M/D/YYYY"));
//         tempSpan.text(data.list[0].main.temp + " F°");
//         windSpan.text(data.list[0].wind.speed + " MPH");
//         humSpan.text(data.list[0].main.humidity + "%");
//         uvIndexSpan.text("33");

//         let iconCode = data.list[0].weather[0].icon;
//         imgEl.attr("src",`http://openweathermap.org/img/w/${iconCode}.png`);
//     }

//     //END FETCH CALLS
    
//     let init = () => {

//         let searchCityButton = $("button.btn-search-city");
//         searchCityButton.on('click',function(event){
//             let searchInput = $("input.search-input").val();
//             alert("Search City Clicked");

//             fetchWeatherData(searchInput);
//             //saveSearchCity(searchInput);
//             $("input.search-input").val('')
//         });
//     }

  
//     init();

// });