# p1-dress-my-ride

## Table of Contents
1. [General Info](#general-info)
2. [Screenshot](#screenshot)
2. [Requirements](#requirements)
3. [Technologies](#technologies)
4. [Installation](#installation)
5. [FAQs](#faqs)
### General Info
***
### aka ride-bot(), because apparently I can't just walk outside and look at the weather!

Web based application assisting cyclist in making decisions about proper attire to be worn on ride, direction and wind speed to assist in route planning. 

Future version makes recommendations for trip packing based on 5 day forecast at any destination
and will generate packing list based on choices.

### Screenshot
***
![Image text](./assets/images/finished-screenshot.png)

## Requirements
***
  USER requires application to assist in picking out gear at a glance for daily rides,
  ensuring clothes are cleaned and ready for upcoming week, or assisting in packing for
  trips by analyzing weather for an upcoming period determined by user.

  PHASE 1
  Phase 1a
  User is presented with the following:
    -text input and search button allowing input of requested search city
    -photo carousel with default photo loaded corresponding to selected radio
    -radio buttons allowing toggling between road and mtb
    -check box allowing temperature override to present cool weather gear.
    -'Get Detailed Wind Patterns' button facilitating presentation of local wind
      patterns for selected ride area.
    -'Clear Search' button allowing clearing of saved cities.

  User enters search city, selects appropriate apparel type radio button, clicks 'Search' 
  button, and is presented with:
    -today's date and weather in the selected city.
    -a carousel loaded with pictures of appropriate clothing pieces for selected apparel 
    type. Images will have caption overlaying.
    
  User can toggle between apparel type choices and be presented with appropriate choices.

  User search city choices will be saved in left nav.

  User will be able to click 'Clear Search' and be returned to default settings.

  Phase 1b
  User is presented with outfit description above carousel

  Phase 1c
  User is presented with heading describing usage of selected outfit.

  Phase 1d
  User is presented with checkbox allowing choice to select night gear
  or not.
  If user checks box, template is loaded containing clothes for the 
  conditions and also headlamp and taillight system.

  Phase 1e
  Add 2 supported templates for cold weather, 1 each for road and mtb

  Phase 1f
  User is able to click button 'Get Detailed Wind Patterns' and be presented with modal 
  dialog presenting wind patterns at latitude and longitude for selected city.

PHASE 2
 Phase 2a
  User is able to click button 'Get Detailed Wind Patterns' and be presented with modal 
  dialog presenting wind patterns at latitude and longitude for selected city.

  Phase 2b
  User is able to click image and is presented with multiple choices of same type of
  gear item; user can select item and it will replace clicked item in carousel and will
  be saved to ride settings.

  Phase 2c
 User will be able to specify a date range and be presented with super-set of gear items
 based on destination forecast. User will be able to output list items to pack for trips, 
 check off completed.

 Phase 2d
 User will be able to bring up strava information on local rides, records set for various
 rides, etc.

 Phase 2e
 User will be able to take picture of item and classify it according to application 
 dropdown menus.

 Future Phase
 User will take picture of item and AI will add to appropriate category.
 
 Autobot will do the packing for you!

## Technologies
***
A list of technologies used within the project:
  * HTML
  * Bootstrap
  * Javascript
  * jQuery
  * MomentJS
  * Server Side Apis
    -open weather api (forecast data)
    -google location api https://maps.googleapis.com/maps/api/geocode(returns latitude and      longitude data for search)

## Installation
***

Link to github repository- https://github.com/dmobrienllc/p1-dress-my-ride

Link to live site- https://dmobrienllc.github.io/p1-dress-my-ride/

## FAQs
***

Q Is this application awesome?

A Why yes it is!
---
