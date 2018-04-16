//HIDE ELEMNTS
//$("#FormGroup2").hide();
//SELECTOR CHANGE VALUE: NAME=SELECTOR SEARCH
/*$('select[name=optionsView]').change(function() {
    let value = $(this).val()
    if(value==="zones"){
        $("#FormGroup2").hide();
        $("#FormGroup1").show();
    }
    else if(value==="subzones"){
        $("#FormGroup1").hide();
        $("#FormGroup2").show();
        searchZones();
    }
    else if(value === ""){
        alert("Select an option view");
    }
    console.log($(this).val())
});
*/
// INITIALIZATION OF THE MAP
var map = L.map("mapid").setView([0, -0], 2);

// LEAFLET STYLE ON THE MAP 
/*L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
*/
// MAPBOX STYLE ON THE MAP
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
var idZoneSelected;
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

//FUNCTION TO CONTROLS THE DRAWING OF A SHAPE.

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
        coordinatesConverted = [];
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

//FUNCTION TO SEARCH THE ADDRESS SPECIFIED.
function searchAddress(){
    //REQUEST GOOGLE GEOCODE API SERVICE
    $.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent($("#zoneAddress").val()) + "&key=AIzaSyDCflB_l_yiXG9F29g65Q33boBrCJTepmM", function(data){
        if (data.status !== "OK") { 
            throw new Error("Unable to geocode address"); 
        }
        else{
            pointMap[0] = data.results[0].geometry.location.lat;
            pointMap[1] = data.results[0].geometry.location.lng;
            console.log(pointMap)
            //COMMENT- map.setView() immediately set the new view to the desired location/zoom level.
            map.setView(new L.LatLng(pointMap[0], pointMap[1]), 18);
            //COMMENT- map.panTo() will pan to the location with zoom/pan animation
            //map.panTo(new L.LatLng(pointMap[0], pointMap[1]));
            return;            
        }
    });
    if(pointMap){
        return pointMap;
    }  
}
function searchZones(){
    fetch("https://smartsecurity-webservice.herokuapp.com/api/zone", {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET, POST, OPTIONS, PUT, PATCH, DELETE'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.dir(data)    
        data.forEach(element =>{
            $('#zoneReference').append($('<option>', {
                value: element['idZone'],
                text: element['name']
            })); 
        })
    })
}
$('#zoneReference').change(function() {
    idZoneSelected = $(this).val()
    //GET ALL INFORMATION OF A SPECIFIC ZONE
    fetch("https://smartsecurity-webservice.herokuapp.com/api/zone/"+idZoneSelected, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET'
        },
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        map.setView(new L.LatLng(data['centerPoint'][0], data['centerPoint'][1]), 18);
        polyline = L.polyline(data['location'], {color: '#ff6666'}).addTo(map);
    })
});
// FUNCTION TO CLEAR THE ADDRESS INPUT OF ZONE
function clearAddress(){
    $("#zoneAddress").val("");    
    map.setView(new L.LatLng(0,0), 2);
    return;
}
//FUNCTION TO CLEAR THE ALL THE INPUTS OF ZONE  
function clearInputsZone(){
    $("#zoneName").val("");
    $("#zoneAddress").val("");    
    $('select[name=zoneCategories]').val("select an option");
    $('#zoneDescription').val("");
    map.setView(new L.LatLng(0,0), 2);
    return;
}
// FUNCTION TO CLEAR ALL THE INPUTS OF SUBZONE
/*function clearInputsSubzone(){
    $("#subzoneName").val("");
    $("select[name=subzoneCategories]").val("");
    $("#subzoneDescription").val("");
    map.setView(new L.LatLng(0,0), 2);
    return;
}*/
// FUNCTION TO SAVE THE ZONE INFORMATION
function saveZone(){
    let zone = {
        name: $("#zoneName").val(),
        address:  $("#zoneAddress").val(),
        //category: $('select[name=zoneCategories]').val(),
        description: $('#zoneDescription').val(),
        centerPoint: pointMap,
        location: coordinatesConverted
    };
    console.log(zone);
    fetch("https://smartsecurity-webservice.herokuapp.com/api/zone", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods':'POST, OPTIONS'
        },
        body : JSON.stringify(zone)
    })
    .then((respuesta) => {
        if(respuesta.status != 201){
            alert("An error has ocurred to save the subzone entity");
            clearInputsZone();
        }
        else{
            console.log(respuesta);
            alert("Zone save successfully");
            clearInputsZone();
        }
    })
    return;
}
//FUCNTION TO SAVE THE SUBZONE INFORMATION.
/*function saveSubzone(){
    let subzone = {
        name: $("#subzoneName").val(),
        category: $("select[name=subzoneCategories]").val(),
        location: coordinatesConverted,
        refZone: idZoneSelected,
        description: $("#subzoneDescription").val()
    }
    //console.log(subzone);

    fetch("https://smartsecurity-webservice.herokuapp.com/api/subzone", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods':'POST'
        },
        body : JSON.stringify(subzone)
    })
    .then((respuesta) => {
        if(respuesta.status != 201){
            alert("An error has ocurred to save the subzone entity");
        }
        else{
            console.log(respuesta);
            console.log("Subzone save successfully");
            clearInputsSubzone();   
        }
    })
    return;
}*/