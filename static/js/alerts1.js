
$("#option-search-subzone").hide();
searchZones();
var firstTimeZones = false;
var firstTimeSubzones = false;
L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA';

//MAP INICIALIZATION
var map = L.mapbox.map('mapid', 'mapbox.streets')
    .setView([0, 0], 2);
// L.marker is a low-level marker constructor in Leaflet.
/*var marker = L.marker([0, 0], {
    icon: L.mapbox.marker.icon({
        'marker-size': 'large',
        'marker-symbol': 'car',
        'marker-color': '#fa0'
    })
})
.addTo(map);*/
//CENTER MARKER
marker.on('click', function(e) {
    map.panTo(marker.getLatLng());
});
//SELECTOR CHANGE VALUE
$('#show-alerts-of').change(function() {
    let value = $(this).val()
    if(value==="principal-zone"){
        $("#option-search-zone").show();
        $("#option-search-subzone").hide();
        searchZones();
    }
    else if(value==="specific-subzone"){
        $("#option-search-subzone").show();
        $("#option-search-zone").hide();
        searchSubzones();
    }
    else if(value === ""){
        alert("Select an option view");
    }
    console.log($(this).val())
});
/*$('#').change(function() {
    let value = $(this).val()
    if(value==="principal-zone"){
        $("#option-search-zone").show();
        $("#option-search-subzone").hide();
        searchZones();
    }
    else if(value==="specific-subzone"){
        $("#option-search-subzone").show();
        $("#option-search-zone").hide();
        searchSubzones();
    }
    else if(value === ""){
        alert("Select an option view");
    }
    console.log($(this).val())
});*/
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
function showSubzones(subzones){
    if(!firstTimeSubzones){
        for(let i=0; i<subzones.length;i++){
            $('#option-search-2').append($('<option>', {
                value: subzones[i]['idSubzone'],
                text: subzones[i]['name']
            })); 
        }
        firstTimeSubzones = true;
    }
}
function searchSubzones(){
    fetch("https://smartsecurity-webservice.herokuapp.com/api/subzone", {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET, OPTIONS'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.dir(data);
        subzones = data;
        showSubzones(subzones)
    })
}
function queryAlerts(){
    if($('#show-alerts-of').val()==="principal-zone"){
        let zoneSelected = $('#option-search-1').val();
        centerMap(zoneSelected, "zone");
        if($('#alerts-visualization').val()==="history"){
            getAlerts("history", "zone", zoneSelected)
        }
        else if($('#alerts-visualization').val()==="current"){
            getAlerts("current", "zone", zoneSelected)
        }
    }
    else if($('#show-alerts-of').val()==="specific-subzone"){
        let subzoneSelected = $('#option-search-2').val();
        centerMap(subzoneSelected, "subzone");
        if($('#alerts-visualization').val()==="history"){
            getAlerts("history", "subzone", subzoneSelected);
        }
        else if($('#alerts-visualization').val()==="current"){
            getAlerts("current", "subzone", subzoneSelected);
        }
    }
}
function getAlerts(alertsVisualization, category, value){
    fetch("https://smartsecurity-webservice.herokuapp.com/service/alerts/"+category+"/"+alertsVisualization+"/"+value, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET, OPTIONS'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.log(data);
        if(!$.isEmptyObject(data)){
            data.forEach((element, index)=>{
                let tempLocation = JSON.parse("["+element['location']+"]")
                console.log(tempLocation);
                var marker = L.marker(JSON.parse("["+element['location']+"]"), {
                    icon: L.mapbox.marker.icon({
                        'marker-size': 'large',
                        'marker-symbol': 'car',
                        'marker-color': '#fa0'
                    })
                })
                .addTo(map);
            })
        }
    })
}
