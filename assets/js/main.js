$(function () {
    let carouselDivEl = $('div.carousel-inner');

    //CLASSES
    class GearItem {
        constructor(index, name, description, type, usage, imgUrl) {
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
    class RideOutfit {
        constructor(index, name, templateName, description, type, imgUrl) {
            this.index = index;
            this.name = name;
            this.template_name = templateName;
            this.description = description;
            this.type = type;
            this.imageUrl = imgUrl;
            this.gearItems = [];
        }
    }

    class PageController {
        constructor(searchCity) {
            this.searchCity
            this.rideOutfits = [];
        }
    }

    let searchNamesArray = [];
    let cardParentDiv = $("div.card-row");
    let dateCardCnt = 0;

    //fetchForecastData
    //returns data from openweather api in json format
    let fetchForecastData = city => {
        localStorage.setItem("last-search-city", city)
        const apiKey = "1602cf34096adba596dbd657831f5ce9";
        let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&cnt=65&appid=${apiKey}`;

        fetch(queryURL)
            .then(function (response) {
                if (response.ok) {
                    response.json().then(function (data) {
                        processWeatherFetchResponse(data);
                    });
                } else {
                    console.log('Not OK: ' + response.statusText);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    //processWeatherFetchResponse
    //mashup layer over display of today's weather and
    //display of 5 day forecast
    let processWeatherFetchResponse = data => {
        displayWeatherToday(data);
        displayOutfitSelection(data);
    }

    //fetchGeolocationData
    //returns data from openweather api in json format
    let fetchGeolocationData = () => {
        let city = localStorage.getItem("last-search-city");

        if(city.length === 0){
            city = "Minneapolis";
        }
        
        const googleApiKey = "1602cf34096adba596dbd657831f5ce9";
        let googleQueryUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${googleApiKey}`;

        // let queryUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
        //let queryUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${city},+MN&key={apiKey}`;
        //     <div class="row">
        //     <p id="windy-iframe"><iframe width="500" height="300"
        //             src="https://embed.windy.com/embed2.html?lat=64.146&lon=21.942&detailLat=64.146&detailLon=21.942&width=650&height=450&zoom=8&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
        //             frameborder="0"></iframe></p>
        // </div>

        fetch(googleQueryUrl, {
            method: 'GET', // or 'PUT'
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': 'cookie-name=geo-fetch; SameSite=None; secure'
            }
          })
            .then(function (response) {
                if (response.ok) {
                    response.json().then(function (data) {
                        processGeolocationFetchResponse(data);
                    });
                } else {
                    console.log('Not OK: ' + response.statusText);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    //processGeolocationFetchResponse
    //parses latitude and longitude from windy.com api and
    //passes to modal dialog
    let processGeolocationFetchResponse = data => {
        alert("Geolocation fetch response");
        console.log(data);
    }

    //displayWeatherToday
    //displays today's weather in main card
    let displayWeatherToday = data => {
        let welcomeSpan = $("span#today-welcome");
        welcomeSpan.text('');

        let citySpan = $("span#today-city");
        let dateSpan = $("span#today-date");
        let imgEl = $("img#header-icon");
        let tempSpan = $("span#today-temp");
        let windSpan = $("span#today-wind");
        let humSpan = $("span#today-humidity");
        let uvIndexSpan = $("span#today-uv-index");

        citySpan.text(data.city.name);
        dateSpan.text(moment(data.list[0].dt_txt.substring(0, 10), "YYYY-MM-DD").format("M/D/YYYY"));
        tempSpan.text(data.list[0].main.temp + " F");
        windSpan.text(data.list[0].wind.speed + " MPH");
        humSpan.text(data.list[0].main.humidity + "%");
        uvIndexSpan.text("33");

        let iconCode = data.list[0].weather[0].icon;
        imgEl.attr("src", `http://openweathermap.org/img/w/${iconCode}.png`);
    }

    let clearWeatherToday = () => {
        let welcomeSpan = $("span#today-welcome");
        welcomeSpan.text("...when simply looking out the window doesn't cut it.");

        let citySpan = $("span#today-city");
        let dateSpan = $("span#today-date");
        let imgEl = $("img#header-icon");
        let tempSpan = $("span#today-temp");
        let windSpan = $("span#today-wind");
        let humSpan = $("span#today-humidity");
        let uvIndexSpan = $("span#today-uv-index");

        citySpan.text('');
        dateSpan.text('');
        tempSpan.text('');
        windSpan.text('');
        humSpan.text('');
        uvIndexSpan.text('');

        // citySpan.text("Your City Here");
        // dateSpan.text("MM/DD/YYYY");
        // tempSpan.text("XX F°");
        // windSpan.text("XX MPH");
        // humSpan.text( "XX %");
        // uvIndexSpan.text("XX");
    }

    //displayOutfitSelection
    //displays selection for type; 
    let displayOutfitSelection = (data) => {

        let success = $('.carousel-inner,.carousel-indicators,.carousel-control-prev,.carousel-control-next').empty()

        let temp;
        let dayNight;

        let typeSelected = $("input[name='customRadio'][type='radio']:checked").val();

        //we will have a more finely graded test
        //here, this works out of the gate
        if (data.list[0].main.temp > 60) {
            temp = "warm";
        } else {
            temp = "cool";
        }

        //until we have colder weather offer opportunity 
        //for cold-weather override
        if ($('#temp-override-check').prop('checked')) {
            temp = "cool";
        }

        if ($('#day-night-check').prop('checked')) {
            dayNight = "night";
        } else {
            dayNight = "day";
        }

        let template = `${typeSelected}_${temp}_dry_${dayNight}`;

        console.log("Template: " + template);

        let outfit = JSON.parse(localStorage.getItem(template));

        $('h3#outfit-description').text('');
        $('h3#outfit-description').text(outfit.description);

        $(outfit.gearItems).each(function (index, item) {
            addCarouselItem(index, item)
        });
    }

    let updateOutfitSelection = (outfitType, template) => {
        //TODO: Consider handling return false?
        let success = $('.carousel-inner,.carousel-indicators,.carousel-control-prev,.carousel-control-next').empty()

        //first need to check if there is a value in the search text 
        //input, if not don't display
        let searchInputVal = $('input#search-input').val();

        if (searchInputVal.length > 0) {
            let outfit = JSON.parse(localStorage.getItem(template));

            $(outfit.gearItems).each(function (index, item) {
                addCarouselItem(index, item)
            });
        } else {
            //add default item back again based on radio button type clicked
            //this could be more elegant
            if (outfitType === "road") {
                addDefaultCarouselItem("road");
            } else {
                addDefaultCarouselItem("mtb");
            }
        }
    }

    //addCarouselItem
    //adds one individual item to carousel
    let addCarouselItem = (index, gearItem) => {

        let divEl = $('<div>').addClass("carousel-item");

        if (gearItem.index === 0) {
            divEl.addClass("active");
        }

        let imgEl = $('<img>').addClass("d-block w-100");
        imgEl.attr("src", gearItem.imgUrl);
        imgEl.attr("data-src", gearItem.imgUrl)
        imgEl.attr("alt", gearItem.name);
        imgEl.attr("value", gearItem.index)

        let divCaptEl = $('<div>').addClass("carousel-content");
        let h3CaptEl = $('<h3>')
        h3CaptEl.text('');
        h3CaptEl.text(gearItem.name);

        let pCaptEl = $("<p>");
        pCaptEl.text(gearItem.description);
        h3CaptEl.append(pCaptEl);
        divCaptEl.append(h3CaptEl);

        divEl.append(imgEl);
        divEl.append(divCaptEl);
        carouselDivEl.append(divEl);

        //event handler facilitating choosing different item
        //from same class
        imgEl.on('click', function (event) {
            console.log("Img Id: " + $(this).attr("value"));
        });
    };

    let addDefaultCarouselItem = (outfitType) => {
        let gearItem;

        $('h3#outfit-description').text('');

        if (outfitType === "mtb") {
            gearItem = new GearItem(0, "Lynskey Ridgeline 29 MTB", "Super strong titanium and carbon MTB.", "Bike", "mtb", "./assets/images/bike-mtb.jpg");
            addCarouselItem(0, gearItem);
            $('h3#outfit-description').text(gearItem.name + ": " + gearItem.description);
        } else {
            gearItem = new GearItem(0, "Specialized Road Bike", "Super-light and strong carbon road ride.", "Bike", "road", "./assets/images/bike-road.jpg");
            addCarouselItem(0, gearItem);
            $('h3#outfit-description').text(gearItem.name + ": " + gearItem.description);
        }
    };

    //clearCarousel
    //clears carousel and replaces default image
    //TODO: Need default image
    let clearCarousel = () => {
        let success = $('.carousel-inner,.carousel-indicators,.carousel-control-prev,.carousel-control-next').empty()
        $('h3#outfit-description').text("");
    }

    //saveSearchCity
    //saves previously search cities in list
    //TODO: Offer 'clear searches' button, or a button for each one to remove
    //from the list (that last one is better)
    let saveSearchCity = city => {
        const found = searchNamesArray.find(element => element === city);

        if (!found) {
            searchNamesArray.push(city);
            let stringifiedArray = JSON.stringify(searchNamesArray);
            localStorage.setItem("stored-cities", stringifiedArray);
            buildSavedSearchCityList();
        }
    }

    //buildSavedSearchCityList
    //clears previous list and builds with new added search
    //if the city has not previously been added to the list
    let buildSavedSearchCityList = () => {
        let ulParentEl = $("ul#saved-search-cities");
        ulParentEl.empty();

        searchNamesArray = JSON.parse(localStorage.getItem("stored-cities"));
        searchNamesArray.sort();

        $(searchNamesArray).each(function (index, item) {
            let liEl = $("<li>").attr("id", index);
            let buttonEl = $("<button>").attr("type", "button").attr("data-search-city", item)
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

        localStorage.setItem("road_warm_dry_day", "");
        localStorage.setItem("road_cool_dry_day", "");
        localStorage.setItem("road_warm_dry_night", "");
        localStorage.setItem("road_cool_dry_night", "");

        localStorage.setItem("mtb_warm_dry_day", "");
        localStorage.setItem("mtb_warm_dry_night", "");
        localStorage.setItem("mtb_cool_dry_day", "");
        localStorage.setItem("mtb_cool_dry_night", "");

        //BEGIN road_warm_dry_day
        let outfit = new RideOutfit(0, "Warm Day Road Ride", "road_warm_dry_day", "Perfect gear for a nice sunny ride on the road.", "Road", "imageUrl");
        let item = new GearItem(0, "Specialized Road Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "Road", "./assets/images/helmet-dual-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "Capo Road Jersey", "Breathable jersey great for hot/warm/humid riding", "Jersey", "Road", "./assets/images/jersey-road-capo.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "Specialized Lycra Shorts", "Super comfortable padded lycra shorts for long road rides.", "Shorts", "Road", "./assets/images/shorts-road-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Endura Road Gloves", "Excellent road glove with great padding.", "Gloves", "Road", "./assets/images/gloves-road-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Smart Wool Socks", "Smartwool socks, cool and dry on the feet!", "Socks", "Road", "./assets/images/socks-road-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Specialized Road Shoes", "High performance road race shoe, carbon plated for power!", "Shoes", "Road", "./assets/images/shoes-road-specialized.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("road_warm_dry_day")) {
            localStorage.setItem("road_warm_dry_day", JSON.stringify(outfit));
        }

        //END road_warm_dry_day

        //BEGIN road_cold_dry_day
        outfit = new RideOutfit(1, "Cold Day Road Ride", "road_cool_dry_day", "When you need to get in the k's but it's cccoooolllddd out there!", "Road", "imageUrl");
        item = new GearItem(0, "Specialized Road Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "Road", "./assets/images/helmet-dual-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "Endura Road Jacket", "Hardcore jacket for cold/rainy riding", "Jacket", "Dual", "./assets/images/jacket-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "Specialized Lycra Bibs", "Super warm padded lycra shorts for cold rides.", "Bibs", "Dual", "./assets/images/bibs-dual-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Endura Road Lobster Mitts", "Super warm mitt for cold weather riding.", "Gloves", "Dual", "./assets/images/gloves-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Smart Wool Socks", "Smartwool socks, super warm for cold days!", "Socks", "Dual", "./assets/images/socks-road-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Specialized Road Shoes", "High performance road race shoe, carbon plated for power!", "Shoes", "Road", "./assets/images/shoes-road-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(6, "Specialized Shoe Warmers", "Wind and water proof road shoe warmer!", "Shoes", "Road", "./assets/images/shoewarmer-road-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(7, "Melanzana Balaclava", "Windproof balaclava is the only way to go in the cold!", "Balaclava", "Dual", "./assets/images/balaclava-dual-melanzana.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("road_cool_dry_day")) {
            localStorage.setItem("road_cool_dry_day", JSON.stringify(outfit));
        }

        //END road_cold_dry_day

        //BEGIN road_warm_dry_night
        outfit = new RideOutfit(2, "Warm Night Road Ride", "road_warm_dry_night", "Perfect setup for a nice nighttime cruise.", "Road", "imageUrl");
        item = new GearItem(0, "Nightsun Lighting System", "Dual Purpose Light System With Taillight", "Lighting", "Dual", "./assets/images/lighting-dual-nightsun.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "Specialized Road Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "Road", "./assets/images/helmet-dual-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "Capo Road Jersey", "Breathable jersey great for hot/warm/humid riding", "Jersey", "Road", "./assets/images/jersey-road-capo.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Specialized Lycra Shorts", "Super comfortable padded lycra shorts for long road rides.", "Shorts", "Road", "./assets/images/shorts-road-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Endura Road Gloves", "Excellent road glove with great padding.", "Gloves", "Road", "./assets/images/gloves-road-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Smart Wool Socks", "Smartwool socks, cool and dry on the feet!", "Socks", "Road", "./assets/images/socks-road-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(6, "Specialized Road Shoes", "High performance road race shoe, carbon plated for power!", "Shoes", "Road", "./assets/images/shoes-road-specialized.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("road_warm_dry_night")) {
            localStorage.setItem("road_warm_dry_night", JSON.stringify(outfit));
        }
        //END road_warm_dry_night

        //BEGIN road_cold_dry_night
        outfit = new RideOutfit(3, "Cold Night Road Ride", "road_cool_dry_night", "When you need to get in the k's but it's cold and dark out there!", "Road", "imageUrl");
        item = new GearItem(0, "Nightsun Lighting System", "Dual Purpose Light System With Taillight", "Lighting", "Dual", "./assets/images/lighting-dual-nightsun.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "Specialized Road Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "Road", "./assets/images/helmet-dual-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "Endura Road Jacket", "Hardcore jacket for cold/rainy riding", "Jacket", "Dual", "./assets/images/jacket-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Specialized Lycra Bibs", "Super warm padded lycra shorts for cold rides.", "Bibs", "Dual", "./assets/images/bibs-dual-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Endura Road Lobster Mitts", "Super warm mitt for cold weather riding.", "Gloves", "Dual", "./assets/images/gloves-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Smart Wool Socks", "Smartwool socks, super warm for cold days!", "Socks", "Dual", "./assets/images/socks-road-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(6, "Specialized Road Shoes", "High performance road race shoe, carbon plated for power!", "Shoes", "Road", "./assets/images/shoes-road-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(7, "Specialized Shoe Warmers", "Wind and water proof road shoe warmer!", "Shoes", "Road", "./assets/images/shoewarmer-road-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(8, "Melanzana Balaclava", "Windproof balaclava is the only way to go in the cold!", "Balaclava", "Dual", "./assets/images/balaclava-dual-melanzana.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("road_cool_dry_night")) {
            localStorage.setItem("road_cool_dry_night", JSON.stringify(outfit));
        }

        //END road_cold_dry_night

        //BEGIN mtb_warm_dry_day
        outfit = new RideOutfit(4, "Warm Day MTB Ride", "mtb_warm_dry_day", "Perfect gear for a great day tearing it up on the trails.", "MTB", "imageUrl");
        item = new GearItem(0, "Specialized MTB Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "MTB", "./assets/images/helmet-mtb-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "LeadVelo T-Shirt", "Super Cool LeadVelo t-shirt from Leadville, CO", "T-Shirt", "MTB", "./assets/images/tshirt-mtb-leadvelo.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "Endura MTB Shorts", "Super functional shorts; from the trail to the brew pub!", "Shorts", "MTB", "./assets/images/shorts-mtb-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Fox MTB Gloves", "Excellent MTB glove with great padding.", "Gloves", "MTB", "./assets/images/gloves-mtb-fox.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Smart Wool Socks", "Smartwool socks, cool and dry on the feet!", "Socks", "MTB", "./assets/images/socks-mtb-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Specialized MTB Shoes", "Tough, comfortable mtb shoe for long days on the trail.", "Shoes", "MTB", "./assets/images/shoes-mtb-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(6, "Poison Spider Cycles Bandana", "Keeps you looking and feeling cool!", "Bandana", "MTB", "./assets/images/bandana-mtb-poisonspider.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("mtb_warm_dry_day")) {
            localStorage.setItem("mtb_warm_dry_day", JSON.stringify(outfit));
        }

        //END mtb_warm_dry_day

        //BEGIN mtb_warm_dry_night
        outfit = new RideOutfit(5, "Warm Night MTB Ride", "mtb_warm_dry_night", "Perfect setup for a nighttime raid!", "MTB", "imageUrl");
        item = new GearItem(0, "Nightsun Lighting System", "Dual Purpose Light System With Taillight", "Lighting", "Dual", "./assets/images/lighting-dual-nightsun.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "Specialized MTB Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "MTB", "./assets/images/helmet-mtb-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "LeadVelo T-Shirt", "Super Cool LeadVelo t-shirt from Leadville, CO", "T-Shirt", "MTB", "./assets/images/tshirt-mtb-leadvelo.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Endura MTB Shorts", "Super functional shorts; from the trail to the brew pub!", "Shorts", "MTB", "./assets/images/shorts-mtb-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Fox MTB Gloves", "Excellent MTB glove with great padding.", "Gloves", "MTB", "./assets/images/gloves-mtb-fox.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Smart Wool Socks", "Smartwool socks, cool and dry on the feet!", "Socks", "MTB", "./assets/images/socks-mtb-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(6, "Specialized MTB Shoes", "Tough, comfortable mtb shoe for long days on the trail.", "Shoes", "MTB", "./assets/images/shoes-mtb-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(7, "Poison Spider Cycles Bandana", "Keeps you looking and feeling cool!", "Bandana", "MTB", "./assets/images/bandana-mtb-poisonspider.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("mtb_warm_dry_night")) {
            localStorage.setItem("mtb_warm_dry_night", JSON.stringify(outfit));
        }
        //END mtb_warm_dry_night

        //BEGIN mtb_cold_dry_day
        outfit = new RideOutfit(6, "Cold Day MTB Ride", "mtb_cool_dry_day", "Super warm outfit for a cold day on the trails.", "MTB", "imageUrl");
        item = new GearItem(0, "Specialized MTB Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "MTB", "./assets/images/helmet-mtb-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "Three Rivers Hat and Buff", "Warm and versatile hat/buff combo", "Hat", "MTB", "./assets/images/hat-dual-threerivers.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "Endura MTB Jacket", "Hardcore jacket for cold/rainy riding", "Jacket", "Dual", "./assets/images/jacket-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Kuhl MTB Pants", "Super warm, mountain stylish, the perfect pants.", "Pants", "MTB", "./assets/images/pants-mtb-kuhl.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Endura MTB Lobster Mitts", "Super warm mitt for cold weather riding.", "Gloves", "Dual", "./assets/images/gloves-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Smart Wool Socks", "Smartwool socks, cool and dry on the feet!", "Socks", "MTB", "./assets/images/socks-mtb-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(6, "Lake Winter MTB Boots", "Tough, comfortable mtb boot for cold days on the trail.", "Boots", "MTB", "./assets/images/shoes-mtb-lake-winter.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("mtb_cool_dry_day")) {
            localStorage.setItem("mtb_cool_dry_day", JSON.stringify(outfit));
        }

        //END mtb_cold_dry_day

        //BEGIN mtb_cold_dry_night
        outfit = new RideOutfit(7, "Cold Night MTB Ride", "mtb_cool_dry_night", "Super warm outfit for a cold night adventure!", "MTB", "imageUrl");
        item = new GearItem(0, "Nightsun Lighting System", "Dual Purpose Light System With Taillight", "Lighting", "Dual", "./assets/images/lighting-dual-nightsun.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(1, "Specialized MTB Helmet", "Dual Purpose Helmet with removable visor", "Helmet", "MTB", "./assets/images/helmet-mtb-specialized.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(2, "Three Rivers Hat and Buff", "Warm and versatile hat/buff combo", "Hat", "MTB", "./assets/images/hat-dual-threerivers.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(3, "Endura MTB Jacket", "Hardcore jacket for cold/rainy riding", "Jacket", "Dual", "./assets/images/jacket-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(4, "Kuhl MTB Pants", "Super warm, mountain stylish, pub ride or hard ride!", "Pants", "MTB", "./assets/images/pants-mtb-kuhl.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(5, "Endura MTB Lobster Mitts", "Super warm mitt for cold weather riding.", "Gloves", "Dual", "./assets/images/gloves-dual-endura.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(6, "Smart Wool Socks", "Smartwool socks, cool and dry on the feet!", "Socks", "MTB", "./assets/images/socks-mtb-smartwool.jpg");
        outfit.gearItems.push(item);

        item = new GearItem(7, "Lake Winter MTB Boots", "Tough, comfortable mtb boot for cold days on the trail.", "Boots", "MTB", "./assets/images/shoes-mtb-lake-winter.jpg");
        outfit.gearItems.push(item);

        if (!localStorage.getItem("mtb_cool_dry_night")) {
            localStorage.setItem("mtb_cool_dry_night", JSON.stringify(outfit));
        }
        //END mtb_cold_dry_night
    }

    //initialize main page elements
    let init = () => {

        //event delegation for saved search cities
        let containerDiv = $("div#saved-search-parent");
        containerDiv.on('click', '.saved-search-button', function (event) {
            let searchCity = $(this).attr("data-search-city");

            fetchForecastData(searchCity);
        });

        let searchButton = $("button.search-button");
        searchButton.on('click', function (event) {
            let searchInput = $("input#search-input").val();

            if (searchInput.length > 0) {
                fetchForecastData(searchInput);
                saveSearchCity(searchInput);
                $("input#search-input").val('')
            } else {
                //snow modal instead of alert
                alert("You must enter a city name!");
                // $('#myModal').modal('toggle');
                // $('#myModal').modal('show');
                // $('#myModal').modal('hide');   
            }
        });

        let getWindPatternButton = $("button#wind-patterns");
        getWindPatternButton.on('click', function (event) {
            alert("Handler is called");
            fetchGeolocationData();
            $('#modal-search-city').text(localStorage.getItem("last-search-city"));
        });

        // let searchGeoButton = $('button#geo-search');
        // searchGeoButton.on('click', function (event) {
        //     //let searchInput = $("input#search-input").val();
        //     alert("Handler is called");
        //     fetchGeolocationData("Minneapolis");
        // });

        let clearSearchButton = $("button.clear-search-button");
        clearSearchButton.on('click', function (event) {
            let ulSearchList = $("ul#saved-search-cities");
            ulSearchList.empty();
            localStorage.setItem("stored-cities", "");
            searchNamesArray.length = 0;
            clearCarousel();
            clearWeatherToday();
            addDefaultCarouselItem('road');
            $('input#select-road').prop('checked', true);
        });

        let selectRoadRadio = $('input#select-road');
        selectRoadRadio.on('click', function (event) {
            $('h3#outfit-description').text("");
            let outfitType = $(this).attr('data-select-type');
            updateOutfitSelection(outfitType, "road_warm_dry_day");
        });

        let selectMtbRadio = $('input#select-mtb');
        selectMtbRadio.on('click', function (event) {
            $('h3#outfit-description').text("");
            let outfitType = $(this).attr('data-select-type');
            updateOutfitSelection(outfitType, "mtb_warm_dry_day");
        });

        if (!localStorage.getItem('stored-cities')) {
            storedSearchCities = localStorage.setItem("stored-cities", "");
        } else {
            buildSavedSearchCityList();
        }

        localStorage.setItem("last-search-city", "");
        $('input#select-road').prop('checked', true);
        loadTemplateData();
        addDefaultCarouselItem();
    }

    init();
});