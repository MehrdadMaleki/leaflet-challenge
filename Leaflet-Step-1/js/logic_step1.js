// Get earthquake data from USGS  
// Store our API endpoint inside url
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
   console.log(data); 
  // Once we get a response, send the data.features object to the createEarthquakes function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  
  // 1. set up a array to hold data  
  var earthquakeMarkers = [];

  //2. set up var for magnitude, lat, lng, latlng, depth, color ="" this will be defined by if functions
  for (var i = 0; i < earthquakeData.length; i++) {
    //define var required
    var magnitude = earthquakeData[i].properties.mag
    // locate lat and lng in coordinates only take [0] & [1]
    var lat = earthquakeData[i].geometry.coordinates[1]
    var lng = earthquakeData[i].geometry.coordinates[0]
    //Combine lat lng
    var latlng = [lat,lng]
    // Establish color for scale
    // Markers should reflect the magnitude Earthquakes with higher magnitudes should appear larger and darker in color.
    var color = "";
    if (magnitude < 3.9){
        color = "lime"
    }
    else if (magnitude < 4.9) {
        color = "green"
    }
    else if (magnitude < 5.9) {
        color = "orange"
    }
    else if (magnitude < 6.9) {
        color = "darkorange"
    }
    else if (magnitude < 7.9) {
        color = "red"
    }
    else {
        color = "darkred"
    }
    earthquakeMarkers.push(
      L.circle(latlng, {
        stroke: false,
        fillOpacity: 0.5,
        color: "white",
        fillColor: color,
        radius: magnitude*50000
    //Include popups that provide additional information about the earthquake when a marker is clicked
    // Popup to show place, magnitute and time of the event  
      }).bindPopup("<h3> Location: " + earthquakeData[i].properties.place + "</h3><hr>" + "<h2> Size: " + earthquakeData[i].properties.mag +
          "</h2><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>")
    )
  }

  //Group so can easily toggle on and off
  var earthquakes = L.layerGroup(earthquakeMarkers)

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define layers satellite and lightmap layers
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  // bring all maps into one object
  var baseMaps = {
    "Satellite": satellite,
    "Lightmap": lightmap
  };

  // Create overlay object to hold our overlay layer
  // AN Create multiple objects to layer on top of map 
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the satellite and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      15.5994, -28.6731
    ],
    zoom: 2,
    layers: [satellite, earthquakes] //AN default layers on start up
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map ** Add to selection drop down
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    }).addTo(myMap);


    // Add  legend to map
    //set up color scale using previous mag scale
    function legendColor(mag){
        if (mag < 4){
          return "lime"
        }
        else if (mag < 5) {
          return "green"
        }
        else if (mag < 6) {
          return "orange"
        }
        else if (mag < 7) {
          return "darkorange"
        }
        else if (mag < 8) {
          return "red"
        }
        else {
          return "darkred"
        }
      }
      
      // Create a legend to display information about our map
      var legend = L.control({
        position: "topright",
        fillColor: "white"
      });
      
      // When the layer control is added, insert a div with the class of "legend"
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var mag = [3.9, 4.9, 5.9, 6.9, 7.9, 9];
        var labels = ["Between: 2-4", "Between: 4-5", "Between: 5-6", "Between: 6-7", "Between: 7-8", "Over: 9+"];
        div.innerHTML = '<div><strong>Registered Points <br> on Richter Scale</strong></div>';
        for (var i = 0; i < mag.length; i++){
          div.innerHTML += '<i style="background:' + legendColor(mag[i]) + '">&nbsp; &nbsp; </i>&nbsp;'+
                          labels[i] + '<br>'; //&nbsp non-breaking space to give padding to color and labels
        }
        return div;
      };
      // Add the legend to the map
      legend.addTo(myMap);
    
    
} // close createmap function

  