$(function() {

    let carouselDivEl = $('div.carousel-inner');

     //CLASSES
    class GearItem{
        constructor(index, name,description,type,usage,imgUrl) {
          this.index = index;
          this.name = name;
          this.description = description;
          this.type = type;
          this.usage = usage;
          this.imgUrl = imgUrl;
        }
      }

    //do you have template outfits instead? I'd say you
    //should, it would make the logic way easier
    class RideOutfit{
        constructor(index, name,templateName,description,type,imgUrl) {
            this.index = index;
            this.name = name;
            this.template_name = templateName;
            this.description = description;
            this.type = type;
            this.imageUrl = imgUrl;
            this.gearItems = [];
          }
    }

    class PageController{
        constructor(searchCity){
            this.searchCity
            this.rideOutfits = [];
        }
    }

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
                processFetchResponse(data);
            });
        } else {
            console.log('Not OK: ' + response.statusText);
        }
        })
            .catch(function (error) {
            console.log(error);
        });
    }

    //processFetchResponse
    //mashup layer over display of today's weather and
    //display of 5 day forecast
    let processFetchResponse = data => {
        displayWeatherToday(data);

        let typeSelected = $("input[name='customRadio']:checked").val();

       displayOutfitSelection(typeSelected,data);
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

    let clearWeatherToday = () => {
        let citySpan = $("span#today-city");
        let dateSpan = $("span#today-date");
        let imgEl = $("img#header-icon");
        let tempSpan = $("span#today-temp");
        let windSpan = $("span#today-wind");
        let humSpan = $("span#today-humidity");
        let uvIndexSpan = $("span#today-uv-index");

        citySpan.text("Your City Here");
        dateSpan.text("MM/DD/YYYY");
        tempSpan.text("XX F°");
        windSpan.text("XX MPH");
        humSpan.text( "XX %");
        uvIndexSpan.text("XX");
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

    //displayOutfitSelection
    //displays selection for type; 
    let displayOutfitSelection = (typeSelected,data) => {
    
        //hack the template name until you develop something
        //more sophisticated
        let temp;
        
        if(data.list[0].main.temp > 60){
            temp = "warm";
        }else{
            temp = "cool";
        }

        //more templates coming on line soon; 
        let template = `${typeSelected}_${temp}_dry_day`;

        let outfit = JSON.parse(localStorage.getItem(template));

        $('h3#outfit-description').text(outfit.description);

        $(outfit.gearItems).each(function(index,item){
            addCarouselItem(index,item)
        });
    }

    let updateOutfitSelection = (template) => {
        //TODO: Consider handling return false?
        let success =  $('.carousel-inner,.carousel-indicators,.carousel-control-prev,.carousel-control-next').empty()

        //first need to check if there is a value in the search text 
        //input, if not don't display
        let searchInputVal = $('input#search-input').val();

        if(searchInputVal.length > 0)
        {
            let outfit = JSON.parse(localStorage.getItem(template));

            $(outfit.gearItems).each(function(index,item){
            addCarouselItem(index,item)
        });
        }
        
    }

    let addCarouselItem = (index,gearItem) => {
        
        console.log(gearItem.imgUrl);
        let divEl = $('<div>').addClass("carousel-item");

        if(gearItem.index === 0){
            divEl.addClass("active");
        }

        let imgEl = $('<img>').addClass("d-block w-100");
        imgEl.attr("src",gearItem.imgUrl);
        imgEl.attr("data-src","holder.js/900x400?theme=social")
        imgEl.attr("alt",gearItem.name);

        let divCaptEl = $('<div>').addClass("carousel-content");
        let h3CaptEl = $('<h3>')
        h3CaptEl.text(gearItem.name);
        divCaptEl.append(h3CaptEl);

        divEl.append(imgEl);
        divEl.append(divCaptEl);
        carouselDivEl.append(divEl);
    };

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
        }

        buildSavedSearchCityList();
    }

    //clearCarousel
    //clears carousel and replaces default image
    //TODO: Need default image
    let clearCarousel = () => {
        let success =  $('.carousel-inner,.carousel-indicators,.carousel-control-prev,.carousel-control-next').empty()
        $('h3#outfit-description').text("");
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

      //loadTemplateData
      //we will load directly from storage once we have
      //a good JSON model to work with
      let loadTemplateData = () => {

          localStorage.setItem("road_warm_dry_day","");
          localStorage.setItem("mtb_warm_dry_day","");

          let outfit = new RideOutfit(0,"Warm Day Road Ride","road_warm_dry_day","Perfect outfit for a nice sunny ride on the road.","Road","imageUrl");
          let item = new GearItem(0,"Specialized Road Helmet","Dual Purpose Helmet with removable visor","Helmet","Road","./assets/images/helmet-dual-specialized.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(1,"Capo Road Jersey","Breathable jersey great for hot/warm/humid riding","Jersey","Road","./assets/images/jersey-road-capo.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(2,"Specialized Lycra Shorts","Super comfortable padded lycra shorts for long road rides.","Shorts","Road","./assets/images/shorts-road-specialized.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(3,"Endura Road Gloves","Excellent road glove with great padding.","Gloves","Road","./assets/images/gloves-road-endura.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(4,"Smart Wool Socks","Smartwool socks, cool and dry on the feet!","Socks","Road","./assets/images/socks-road-smartwool.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(5,"Specialized Road Shoes","High performance road race shoe, carbon plated for power!","Shoes","Road","./assets/images/shoes-road-specialized.jpg");
          outfit.gearItems.push(item);

          if(!localStorage.getItem("road_warm_dry_day")){
              localStorage.setItem("road_warm_dry_day",JSON.stringify(outfit));
          }

          outfit = new RideOutfit(1,"Warm Day MTB Ride","mtb_warm_dry_day","Perfect outfit for a great day tearing it up on the trails.","MTB","imageUrl");
          item = new GearItem(0,"Specialized MTB Helmet","Dual Purpose Helmet with removable visor","Helmet","MTB","./assets/images/helmet-mtb-specialized.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(1,"LeadVelo T-Shirt","Super Cool LeadVelo t-shirt from Leadville, CO","T-Shirt","MTB","./assets/images/tshirt-mtb-leadvelo.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(2,"Endura MTB Shorts","Super comfortable and stylish shorts for straight from the trail to the brew pub!","Shorts","MTB","./assets/images/shorts-mtb-endura.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(3,"Fox MTB Gloves","Excellent MTB glove with great padding.","Gloves","MTB","./assets/images/gloves-mtb-fox.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(4,"Smart Wool Socks","Smartwool socks, cool and dry on the feet!","Socks","MTB","./assets/images/socks-mtb-smartwool.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(5,"Specialized MTB Shoes","Tough, comfortable mtb shoe for long days on the trail.","Shoes","MTB","./assets/images/shoes-mtb-specialized.jpg");
          outfit.gearItems.push(item);

          item = new GearItem(6,"Poison Spider Cycles Bandana","Keeps you looking and feeling cool!","Bandana","MTB","./assets/images/bandana-mtb-poisonspider.jpg");
          outfit.gearItems.push(item);
           
          if(!localStorage.getItem("mtb_warm_dry_day")){
            localStorage.setItem("mtb_warm_dry_day",JSON.stringify(outfit));
        }
      }

    //initialize main page elements
    let init = () => {

        let citySpan = $("span#today-city");
        let dateSpan = $("span#today-date");
        citySpan.text("Your city here")
        dateSpan.text(moment().format("MM/DD/YYYY"));

        $("span#today-temp").text('XX F');
        $("span#today-wind").text('XX MPH');
        $("span#today-humidity").text('XX %')
        $("span#today-uv-index").text('33')

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
            clearCarousel();
            clearWeatherToday();
        });

        let selectRoadRadio = $('input#select-road');
        selectRoadRadio.on('click',function(event){
            $('h3#outfit-description').text("");
            let outfitType = $(this).attr('data-select-type'); 
            updateOutfitSelection(outfitType,"road_warm_dry_day");
        });

        $('input#select-road').prop('checked', true);

        let selectMtbRadio = $('input#select-mtb');
        selectMtbRadio.on('click',function(event){
            $('h3#outfit-description').text("");
            let outfitType = $(this).attr('data-select-type'); 
            updateOutfitSelection(outfitType,"mtb_warm_dry_day");
        });

        if(!localStorage.getItem("stored-cities")){
            storedSearchCities = localStorage.setItem("stored-cities",""); 
        }else{
            //repopulate the list on refresh
            buildSavedSearchCityList();
        }

        loadTemplateData();
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