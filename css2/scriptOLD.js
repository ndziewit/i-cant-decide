
// ---- VARIABLES ---- //

const menuIcon = document.querySelector('.hamburger-menu');
const navbar= document.querySelector('.navbar');
let currentYelpObj
let latitude
let longitude
let currentInd

// --- EVENT HANDLERS --- //

//triggers hiding home btns and showing map and yelp info
$(document).on("click", ".home-btns", (event) => {
    homeBtnClick(event)
    console.log(event);
});

//triggers left/right arrow functionality
$("#left-right").on("click", (event) => {
    clickLR(event)
});

//gets user lat / lng on doc load
$(document).on("load", getPosition())

//toggles side navbar
menuIcon.addEventListener('click',() =>{
    navbar.classList.toggle("change");
});

$("#heart").on("click", () => {
    storeCurrent(currentInd)
});

// ---- FUNCTIONS ---- //

// --- User interaction functions --- ///

//event function to trigger Drink/Eat based on click event
function homeBtnClick(event) {
    if ( event.target.alt === "Drink Button" ) {
        yelpDrink(latitude, longitude)
        weather(latitude, longitude)
    } else if ( event.target.alt === "Food Button" ) {
        yelpEat(latitude, longitude)
        weather(latitude, longitude)
    } else {
        //exception handler here
    }
};

//hides the homebtns and shows the map + placeholders at index 0 
function toggleMapBox() {
    $(".home-btns").toggle();
    $("#placeholder-div").toggle();
    switchYelp(0)
    currentInd = 0
};

//event function to handle left and right arrow clicks to scroll through the yelpObj. Populates placeholder divs and updates the placeholder google map
function clickLR(event) {
    if (event.target.classList.contains("left-a")) {
        if ( currentInd === 0 ) {
            console.log(currentInd)
            currentInd = currentYelpObj.businesses.length
            switchYelp(currentInd)
            updateMap(currentYelpObj.businesses[currentInd].coordinates.latitude, currentYelpObj.businesses[currentInd].coordinates.longitude)
        } else {
            console.log(currentInd)
            currentInd --
            switchYelp(currentInd)
            updateMap(currentYelpObj.businesses[currentInd].coordinates.latitude, currentYelpObj.businesses[currentInd].coordinates.longitude)
        }
    } else if (event.target.classList.contains("right-a")) {
        if ( currentInd === currentYelpObj.businesses.length ) {
            console.log(currentInd)
            currentInd = 0
            switchYelp(currentInd)
            updateMap(currentYelpObj.businesses[currentInd].coordinates.latitude, currentYelpObj.businesses[currentInd].coordinates.longitude)
        } else {
            console.log(currentInd)
            updateMap(currentYelpObj.businesses[currentInd].coordinates.latitude, currentYelpObj.businesses[currentInd].coordinates.longitude)
            currentInd ++
            switchYelp(currentInd)
            updateMap(currentYelpObj.businesses[currentInd].coordinates.latitude, currentYelpObj.businesses[currentInd].coordinates.longitude)
        }
    }
    //there are some weird index errors we need to fix here but it works fine enough for now
};

// -- API functions -- //

function weather(latitude, longitude) {
    var dateTime = moment().format('dddd, MMMM Do YYYY');
    var apiKey = "0ec949b8b13f2ad5d8653cd84a541bde"
    var queryURL = "https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey;


    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        var cityName = response.name;
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
        console.log(response);

        $("#weather-div").css("display", "inherit");
        $("#city-name").text(cityName + " " + "(" + dateTime + ")" + " ").append(img)
        $("#temp").text("Temperature (F): " + tempF.toFixed(2));
    
    })
}

//runs yelpAPI by passing in lat & lng with the search term bar. Saves the object to currentYelpObj
function yelpDrink(latitude, longitude) {
        var queryUrl = "https://cors-anywhere.herokuapp.com/api.yelp.com/v3/businesses/search?term=bar&latitude=" + latitude + "&longitude=" + longitude;

        $.ajax({
            url: queryUrl,
            method: "GET",
            headers: {
                "Authorization": "Bearer onVbl7k5cpGLZGH64zpFqN58hJoywsYCQdA1MeVe9Ef-M3hxHzaGB3ORpNWfMA7S3ux-c1tMVy5r51Qq34xLirIogtuifiIcT9RFeJzWj-23_UZctLUMbD4jqsP3XnYx",
            }
        }).then(function(response) {
            currentYelpObj = response
            toggleMapBox()
        });
};

//runs yelpAPI by passing in lat & lng with the search term restaurant. Saves the object to currentYelpObj
function yelpEat(latitude, longitude) {
        var queryUrl = "https://cors-anywhere.herokuapp.com/api.yelp.com/v3/businesses/search?term=restaurant&latitude=" + latitude + "&longitude=" + longitude

        $.ajax({
            url: queryUrl,
            method: "GET", 
            headers: {
                "Authorization": "Bearer onVbl7k5cpGLZGH64zpFqN58hJoywsYCQdA1MeVe9Ef-M3hxHzaGB3ORpNWfMA7S3ux-c1tMVy5r51Qq34xLirIogtuifiIcT9RFeJzWj-23_UZctLUMbD4jqsP3XnYx",
            }
        }).then(function(response) {
            currentYelpObj = response
            toggleMapBox()
        });
};

//gets user coordinates
function getPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
        console.log(showPosition)
    }; 
      function showPosition(position) {
        console.log("Latitude: " + position.coords.latitude + " " +
        "Longitude: " + position.coords.longitude);
        
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    };
};

function storeCurrent(ind) {
    let oldItems= JSON.parse(localStorage.getItem('saved-obj')) || []

    let saveObj = {
        yelpBusiness: currentYelpObj.businesses[ind].name,
        yelpType: currentYelpObj.businesses[ind].categories[0].title,
        yelpRating: currentYelpObj.businesses[ind].rating,
        yelpDist: (currentYelpObj.businesses[ind].distance).toFixed(0),
        yelpLat: currentYelpObj.businesses[ind].coordinates.latitude,
        yelpLng: currentYelpObj.businesses[ind].coordinates.longitude
    }

    oldItems.push(saveObj);

    localStorage.setItem('saved-obj', JSON.stringify(oldItems))
};

// --- DOM functions --- //

//updates all of the placeholder divs with new yelp info (triggered from left/right arrows)
function switchYelp(ind) {
    $("#business").text(currentYelpObj.businesses[ind].name)
    $("#type").text(currentYelpObj.businesses[ind].categories[0].title)
    $("#rating").text(currentYelpObj.businesses[ind].rating)
    $("#distance").text((currentYelpObj.businesses[ind].distance).toFixed(0))
};

//initializes map to current location
function initMap() {
    var mapURL = "https://www.google.com/maps/embed/v1/view?zoom=15&center=" + latitude + "%2C" + longitude + "&key=AIzaSyDMTbiZBhMhP9h1zIfI3PWius0RL6YRBSU";
    var mapDiv = $('<iframe>').addClass("map-view").width("100%").height("100%").attr("src", mapURL);
    $('.left-right').append(mapDiv);
    $('.map-view').html(mapURL);
  }
//udpates the placeholder map with new restaurant coordinates (triggered from left/rigth arrows)
function updateMap(lat, lng) {
    $(".map-view").replaceWith(`<iframe class="map-view" src="https://maps.google.com/maps?q=${lat}, ${lng}&z=15&output=embed" width="100%" height="100%" frameborder="0" style="border:0"></iframe>`)
};

/* TO DO */

// Consolidate yelp functions into one
// Get Coords on page open so were not waiting on yelp function
