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
        color = "yellow"
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
        fillOpacity: 0.7,
        color: "white",
        fillColor: color,
        radius: magnitude*50000 // manify radius to show impact of earth quake
    //Include popups that provide additional information about the earthquake when a marker is clicked
    // Popup to show place, magnitute and time of the event  
      }).bindPopup("<h3> Location: " + earthquakeData[i].properties.place + "</h3><hr>" + "<h2> Size: " + earthquakeData[i].properties.mag +
          "</h2><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>")
    )
  }

    // Bonus** Tectonic Plates map overlay
    //create an new layer group
    var tectonicPlates = L.layerGroup();

    //get Json from new URL
    //get the raw file
    var newurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    // Get a response
    d3.json(newurl, function(data){
      L.geoJSON(data, {
        style: function() {
          return {
              color:"hotpink",
              weight: 1.2
            }
        }
      }).addTo(tectonicPlates)
    })

  //Group so can easily toggle on and off
  var earthquakes = L.layerGroup(earthquakeMarkers)
  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, tectonicPlates);
}


function createMap(earthquakes, tectonicPlates) {

  // Define layers nasa, terrain and lightmap layers
  var nasa = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
	attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
	bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
	minZoom: 1,
	maxZoom: 8,
	format: 'jpg',
	time: '',
	tilematrixset: 'GoogleMapsCompatible_Level'
    });

    var terrain = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
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
    "Nasa": nasa,
    "Terrain": terrain,
    "Lightmap": lightmap
  };

  // Create overlay object to hold our overlay layer
  // AN Create multiple objects to layer on top of map 
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates" : tectonicPlates
  };

  // Create our map, giving it the lightmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      15.5994, -28.6731
    ],
    zoom: 2,
    layers: [lightmap, earthquakes, tectonicPlates] //AN default layers on start up
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map ** Add to selection drop down
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    }).addTo(myMap);


    // Add  legend to map
    //set up color scale using previous magnitude scale
    function legendColor(mag){
        if (mag < 4){
          return "lime"
        }
        else if (mag < 5) {
          return "yellow"
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
      
      // Create a legend to display box
      var legend = L.control({
        position: "topright",
        fillColor: "white"
      });
      
      // When the layer control is added, insert a div with the class of "legend"
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var mag = [3.9, 4.9, 5.9, 6.9, 7.9, 9];
        var labels = ["Between: 2-4", "Between: 4-5", "Between: 5-6", "Between: 6-7", "Between: 7-8", "Over: 8+"];
        div.innerHTML = '<div><strong>Registered Points <br> on Richter Scale</strong></div>';
        // loop through our magnitude intervals and generate a label with a colored matching legendColor
        for (var i = 0; i < mag.length; i++){
          div.innerHTML += 
              '<i style="background:' + legendColor(mag[i]) + '">&nbsp; &nbsp; </i>&nbsp;'+
                labels[i] + '<br>'; //&nbsp non-breaking space to give padding to color legends and their labels
        }
        return div;
      };
      // Add the legend to the map
      legend.addTo(myMap);
    
    
} // close createmap function

  