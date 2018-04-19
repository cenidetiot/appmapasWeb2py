
searchZones();
var firstTimeZones = false;
var firstTimeSubzones = false;
var marker;
var markerLayer = L.layerGroup()

L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA';

var options = {
    center: [0, -0],
    zoom: 2,
    layers: [markerLayer]
}
//MAP INICIALIZATION
var map = L.mapbox.map('mapid', 'mapbox.streets', options)

// MAPBOX STYLE ON THE MAP
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 22,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA'
}).addTo(map);

//CENTER MARKER
function markerOnClick(e){
    map.panTo(this.getLatLng());
}

$('#alerts-visualization').change(function() {
    map.setView(new L.LatLng(0, 0), 2); 
    markerLayer.clearLayers();
    map.removeLayer(markerLayer)
})
function centerMap(value, category){
    fetch("https://smartsecurity-webservice.herokuapp.com/api/"+category+"/"+value, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.dir(data)   
        map.setView(new L.LatLng(data['centerPoint'][0], data['centerPoint'][1]), 19);
        polyline = L.polyline(data['location'], {color: '#ff6666'}).addTo(map);
    })
}
function showZones(zones){
    if(!firstTimeZones){
        for(let i=0; i<zones.length;i++){
            $('#option-search-1').append($('<option>', {
                value: zones[i]['idZone'],
                text: zones[i]['name']
            })); 
        }
        firstTimeZones = true;
    }
}
function searchZones(){
    fetch("https://smartsecurity-webservice.herokuapp.com/api/zone", {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET, OPTIONS'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.dir(data)   
        zones = data; 
        showZones(zones);
    })
}

function queryAlerts(){
    let zoneSelected = $('#option-search-1').val();
    centerMap(zoneSelected, "zone");
    if($('#alerts-visualization').val()==="history"){
        getAlerts("history", "zone", zoneSelected)
    }
    else if($('#alerts-visualization').val()==="current"){
        getAlerts("current", "zone", zoneSelected)
    }
}
function getAlerts(alertsVisualization, category, value){
    markerLayer.clearLayers();
    map.removeLayer(markerLayer)
    fetch("https://smartsecurity-webservice.herokuapp.com/service/alerts/"+category+"/"+alertsVisualization+"/"+value, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET, OPTIONS'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        var colorAlert;
        console.log(data);
        if(!$.isEmptyObject(data)){
            data.forEach((element, index)=>{
                let tempLocation = JSON.parse("["+element['location']+"]")
                console.log(tempLocation);
                if(element['severity']==="informational"){
                    colorAlert = '#A69E9A'
                }
                else if(element['severity']==="low"){
                    colorAlert = '#4A9EDD'
                }
                else if(element['severity']==="medium"){
                    colorAlert = '#fa0'
                }
                else if(element['severity']==="high"){
                    colorAlert = '#FA6819'
                }
                else if(element['severity']==="critical"){
                    colorAlert = '#D50615'
                }
                marker = L.marker(JSON.parse("["+element['location']+"]"), {
                    icon: L.mapbox.marker.icon({
                        'marker-size': 'large',
                        'marker-symbol': 'car',
                        'marker-color': colorAlert
                    })
                })
                .on('click', markerOnClick)
                .bindPopup('Category: '+element['category']+'<br/> Subcategory: '+element['subCategory']+'<br/> Severity: '+element['severity']).openPopup()
                .addTo(markerLayer);
            })
        }
        markerLayer.addTo(map);
    })
}
