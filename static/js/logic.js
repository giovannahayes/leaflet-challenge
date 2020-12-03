// Create variable for JSON
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a GET request to the query URL 
d3.json(url)
    .then(function (data) {
        createFeatures(data.features);
    });

// Function to determine marker size based on magnitude. 
// Earthquakes with higher magnitude should appear larger in size. 
function markerSize(circle) {
    return circle * 5;
}


//Fucntion to determine color of marker size based on magnitue.
// Earthquakes with higher magnitude should appear darker in color.
function chooseColor(mag) {
    if (mag > 5) { return "darkred" }
    else if (mag > 4) { return "red" }
    else if (mag > 3) { return "orange" }
    else if (mag > 2) { return "yellow" }
    else if (mag > 1) { return "limegreen" }
    else { return "green" }
}

function createFeatures(earthquakeData) {
    //Give feature a popup describing the magnitude, place, and time of the earthquake 
    function onEachFeature(feature, layer) {
        layer.bindPopup("Magnitude:" + feature.properties.mag + "<br>Location:" + feature.properties.place + "<br>Date:" + new Date(feature.properties.time))
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        //Create circleMarker
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        //Style each mag feature 
        style: function (feature) {
            // console.log(feature.properties.mag)
            return {
                fillColor: chooseColor(feature.properties.mag),
                fillOpacity: 1,
                weight: 1.5,
                radius: markerSize(feature.properties.mag),
                stroke: false
            }
        },

        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {
    //Deinfe satellitte layer 
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    // Define light layer
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        //size of image-set to default 
        tileSize: 512,
        //how many times you can zoom into
        maxZoom: 18,
        zoomOffset: -1,
        //tpye of map
        id: "mapbox/light-v10",
        //API Key
        accessToken: API_KEY
    });

    // Deine outdoors layer 
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellite,
        "Greyscale": lightMap,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [satellite, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //Create Legend 
    var legend = L.control({ position: "bottomright" });
    console.log(L);
    console.log(legend);
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var mag = [0, 1, 2, 3, 4, 5];

        for (var i = 0; i < mag.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(mag[i] + 1) + '"></i> ' +
                mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(myMap);
}