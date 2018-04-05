//HIDE ELEMNTS
$("#FormGroup2").hide();
//SELECTOR CHANGE VALUE: NAME=SELECTOR SEARCH
$('select[name=optionsView]').change(function() {
    let value = $(this).val()
    if(value==="zones"){
        $("#FormGroup2").hide();
        $("#FormGroup1").show();
    }
    else if(value==="subzones"){
        $("#FormGroup1").hide();
        $("#FormGroup2").show();
    }
    else if(value === ""){
        alert("Select an option view");
    }
    console.log($(this).val())
});

var map = L.map("mapid").setView([18.876551, -99.220100], 20);

// LEAFLET STYLE ON THE MAP 
/*L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
*/
// MAPBOX STYLE ON MAP
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA'
}).addTo(map);

//GLOBAL VARIABLES 
var coordinatesConverted = []; 
var polylineArrayCoordinates = [];
var pointMap = [];
var editableLayers = new L.FeatureGroup();

map.addLayer(editableLayers);

//DRAW CONTROLS OF MAP
var drawControl = new L.Control.Draw({
    position: 'topleft',
    draw: {
        marker: {
          icon: L.icon({
            iconUrl: '../static/css/images/marker-icon.png',
            shadowUrl: '../static/css/images/marker-shadow.png'
          })
        },
        polygon:{   
            shapeOptions: {
                color: '#ff6666'
            },        
            showArea: true
        },
        polyline: {
            shapeOptions: {
                color: '#008B8B',
                weight: 8
            }
        },
        circle: false,
        circlemarker: false
    },
    edit: {
        featureGroup: editableLayers, //REQUIRED!!
        edit: false
    }
});
map.addControl(drawControl);

L.marker([18.876551, -99.220100]).addTo(map)
    .bindPopup('CENIDET.<br> CAMPUS PALMIRA.')
    .openPopup();

map.on('draw:created', function (e) {
   var type = e.layerType;
   console.log(type);
   var layer = e.layer;
   if (type === 'marker'){
        console.log("CREANDO MARCADOR");
        let coordinates = layer.getLatLng();
        console.log(coordinates);
    }
    if (type === 'polygon') {
        console.log("CREANDO POLÍGONO");
        var polygon = layer.toGeoJSON();
        var polygonCoordinates = polygon['geometry']['coordinates'];

        //CONVERT COORDINATES [LON,LAT] GeoJSON IN [LAT,LON] COORDINATES.
        for(let i=0; i<polygonCoordinates.length;i++){
          for(let j=0; j<polygonCoordinates[i].length;j++){
            coordinatesConverted.push([polygonCoordinates[i][j][1],polygonCoordinates[i][j][0]]);         
          }
        }
        console.log(JSON.stringify(polygon));
        console.log(polygonCoordinates);
        console.log("Coordenadas  [lat,long] del polígono ");
        console.log(coordinatesConverted);   
    }
    if(type === 'polyline'){
        console.log("CREANDO POLILÍNEA");
        var polylineCoordinates = layer.getLatLngs();
        //CONVERT POLYLINE COORDINATES INTO ARRAY OF COORDINATES 
        polylineCoordinates.forEach(element => {
            polylineArrayCoordinates.push([element['lat'],element['lng']])
        });
        console.log(polylineCoordinates);
        console.log(polylineArrayCoordinates);
    }
    if(type === 'rectangle'){
        console.log("CREANDO RECTANGULO");
    }
   // Do whatever else you need to. (save to db; add to map etc)
   editableLayers.addLayer(layer);
   //drawnItems.addLayer(layer);
});
function searchAddress(){
    //REQUEST GOOGLE GEOCODE API SERVICE
    $.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent($("#InputAddressZone").val()) + "&key=AIzaSyDCflB_l_yiXG9F29g65Q33boBrCJTepmM", function(data){
        if(data.length===0){
            console.log("Anything answer");
        }
        else{
            console.log(data);
            if (data.status !== "OK") { throw new Error("Unable to geocode address"); }
            else{
                pointMap[0] = data.results[0].geometry.location.lat;
                pointMap[1] = data.results[0].geometry.location.lng;
                console.log(pointMap)
                return;
            }            
        }
    });
    if(pointMap){
        return pointMap;
    }
}
function clearAddress(){
    $("#InputAddressZone").val("");    
    return;
}
function clearInputs(){
    $("#zone-name").val("");
    $("#InputAddressZone").val("");    
    $('select[name=categories-list]').val("select an option");
    $('#InputDescriptionZone').val("");
    return;
}
function saveZone(){
    let zone = {
        name: $("#zone-name").val(),
        address:  $("#InputAddressZone").val(),
        category: $('select[name=categories-list]').val(),
        description: $('#InputDescriptionZone').val(),
        centerPoint: pointMap,
        location: coordinatesConverted
    };
    console.log(zone);
    $.ajax({  
        url:'http://localhost:4005/api/zone',
        data: JSON.stringify(zone),
        type:'POST',
        dataType: "json",
        success:function(respuesta) {   
            console.log(respuesta);
        }
    }); 
}
function saveSubzone(){
    return;
}