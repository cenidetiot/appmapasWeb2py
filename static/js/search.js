//Variables
var valueSelectorSearch = "";
var valueSelectorParameterSearch = "";
var date = "";
var dateTime = "";
var searchParameter = null;
var locationCoordinates = [];
var campus = [];
var campusData;
var campusLocation = [];
var map;
//MAP CONTAINER 
map = L.map("mapid").setView([0,0], 2);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
$("#dateTimeInput").hide();

//GET ALL CAMPUS REGISTERED
$.get("https://driving-monitor-service.herokuapp.com/api/campus", function(data){
    if(data.length===0){
        console.log("No se encontraron campus ");
    }
    else{
        campus = data;
        campus.forEach(element => {
            $('#select-search-zone').append($('<option>', {
                value: element['_id'],
                text: element['name']
            })); 
        });
    }
});
//SELECTOR CHANGE VALUE: NAME=SELECTOR ZONE
$('select[name=selectorZone]').change(function() {
    let idCampus = $(this).val()
    //GET ALL INFORMATION OF A SPECIFIC CAMPUS
    $.get("https://driving-monitor-service.herokuapp.com/api/campus/"+idCampus, function(data){
        if(data.length===0){
            console.log("No se encontraron información del campus ");
        }
        else{
            campusData = data;
            campusLocation = data['location'];
            let campusLatitude = data['pointMap'][0]['latitude'];
            let campusLongitude = data['pointMap'][0]['longitude'];
            map.remove();
            map = L.map("mapid").setView([campusLatitude,campusLongitude], 19);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);  
        }
    });
});

//SELECTOR CHANGE VALUE: NAME=SELECTOR SEARCH
$('select[name=selectorSearch]').change(function() {

    valueSelectorSearch = $(this).val()
    if(valueSelectorSearch==="idDevice"){
        $("#label-input-search").html("ID Device: ");
    }
    else if(valueSelectorSearch==="owner"){
        $("#label-input-search").html("Owner: ");
    }
    else if(valueSelectorSearch==="username"){
        $("#label-input-search").html("Username: ");
    }
    console.log($(this).val())
});
//SELECTOR CHANGE VALUE: NAME= SELECTOR PARAMETER SEARCH
$('select[name=selectorparameterSearch]').change(function() {
    valueSelectorParameterSearch = $(this).val()
    if(valueSelectorParameterSearch === "date"){
        $("#label-date-input").html("Date: ");
        $("#dateInput").show();
        $("#dateTimeInput").hide();
    }
    else if(valueSelectorParameterSearch==="dateTime"){
        $("#label-date-input").html("DateTime: ");
        $("#dateTimeInput").show();
        $("#dateInput").hide();
    }
    console.log($(this).val())
});
//SEARCHING  GENERAL FUNCTION
function searching(){
    searchParameter = $('#input-search').val();
    console.log(searchParameter);
    if(searchParameter!=null){
        if(valueSelectorSearch==="idDevice"){
            searchingIDDevice();
        }
        else if(valueSelectorSearch==="owner"){
            searchingOwnerDevice();
        }
        else if(valueSelectorSearch==="username"){
            searchingUsername();
        }
    }
    else{
        console.log("You need to specify a option search ");
    }
}
function searchingUserInCampus(locationCoordinates){
    console.log(locationCoordinates.join(","))
    console.log(campusLocation.join(";"));
    let query = {
        point: locationCoordinates.join(","),
        polygon: campusLocation.join(";")
      }
    $.post("https://driving-monitor-service.herokuapp.com/api/pointCampus",query,function(data, status){
        let isOnCampus = data['isOnCampus'];
        console.log(data['isOnCampus']);
        if(!isOnCampus){
            return false;
        }
        else{
            return true;
        }
    });
}
function searchingOwnerDevice(){
    if(valueSelectorParameterSearch === "date"){
        date = $("#dateInput").val();
        let dateUTC = new Date(date).toISOString();
        console.log(dateUTC);
        console.log(date);
        $.get("https://cratedrivingapp-service.herokuapp.com/api/locationOwnerDate?owner="+searchParameter+"&date="+date, function(data){
            if(data.length===0){
                console.log("No se encontraron dispositivos con el id de usuario: "+searchParameter);
                alert("No se encontraron dispositivos con el id de usuario: "+searchParameter);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived);
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                if(searchingUserInCampus(locationCoordinates)){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                    console.log("No se encontraron dispositivos con el id de usuario: "+searchParameter+", en la zona del campus especificado");
                }           
            }
        });
    }
    else if(valueSelectorParameterSearch === "dateTime"){
        dateTime = $("#dateTimeInput").val();
        console.log(dateTime);
        let dateTimeUTC = new Date(dateTime).toISOString();
        console.log(dateTimeUTC);
        let dateTimeSplit = dateTimeUTC.split("T");
        console.log(dateTimeSplit);
        let timeHour = dateTimeSplit[1].substring(0,2);
        console.log(timeHour);
        $.get("https://cratedrivingapp-service.herokuapp.com/api/locationOwnerDateTime?owner="+searchParameter+"&date="+dateTimeSplit[0]+"&time="+timeHour, function(data){
            if(data.length===0){
                console.log("No se encontraron dispositivos con el id de usuario: "+searchParameter);
                alert("No se encontraron dispositivos con el id de usuario: "+searchParameter);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived);
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                if(searchingUserInCampus(locationCoordinates)){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado el día y hora: "+dateTime);
                    console.log("No se encontraron dispositivos con el id de usuario: "+searchParameter+", en la zona del campus especificado");
                }           
            }
        });
    }
    else{
        console.log("You need to specify a parameter of search");
    }
}
function searchingIDDevice(){
    if(valueSelectorParameterSearch === "date"){
        var date = $("#dateInput").val();
        console.log(date);
        $.get("https://cratedrivingapp-service.herokuapp.com/api/locationDeviceDate?idDevice="+searchParameter+"&date="+date, function(data){
            if(data.length===0){
                console.log("No se encontraron dispositivos con el idDevice: "+searchParameter);
                alert("No se encontraron dispositivos con el idDevice: "+searchParameter);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived);
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                if(searchingUserInCampus(locationCoordinates)){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                    console.log("No se encontraron dispositivos con el id de usuario: "+searchParameter+", en la zona del campus especificado");
                }           
            }
        });
    }
    else if(valueSelectorParameterSearch === "dateTime"){
        dateTime = $("#dateTimeInput").val();
        console.log(dateTime);
        let dateTimeUTC = new Date(dateTime).toISOString();
        console.log(dateTimeUTC);
        let dateTimeSplit = dateTimeUTC.split("T");
        console.log(dateTimeSplit);
        let timeHour = dateTimeSplit[1].substring(0,2);
        console.log(timeHour);
        $.get("https://cratedrivingapp-service.herokuapp.com/api/locationDeviceDateTime?idDevice="+searchParameter+"&date="+dateTimeSplit[0]+"&time="+timeHour, function(data){
            if(data.length===0){
                console.log("No se encontraron dispositivos con el id de usuario: "+searchParameter);
                alert("No se encontraron dispositivos con el idDevice: "+searchParameter);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived);
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                if(searchingUserInCampus(locationCoordinates)){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado el día y hora: "+dateTime);
                    console.log("No se encontraron dispositivos con el id de usuario: "+searchParameter+", en la zona del campus especificado");
                }           
            }
        });     
    }
    else{
        console.log("You need to specify a parameter of search");
    }
}
function searchingUsername(){
    let nameArray = searchParameter.split(" ");
    let first_name = nameArray[0];
    let last_name = nameArray[1];
    $.get(`https://smartsdk-web-service.herokuapp.com/api/user?first_name=${first_name}&last_name=${last_name}`, function(data){
        console.log(status);
        if(data!=null){
            console.log(data);
            let idUser = "User:"+data['id'];
            console.log(idUser),
            searchParameter = idUser;
            console.log(searchParameter);
            searchingOwnerDevice();
        }
        else{
            alert("Usuario de nombre: "+first_name+" "+last_name+" no encontrado")
        }
    });
}

function showMap(location, dataReceived){
    console.log(location);
    let data = JSON.parse(dataReceived);

    map.remove();
    map = L.map("mapid").setView(location, 19);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var editableLayers = new L.FeatureGroup();

    map.addLayer(editableLayers);

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

    L.marker(location).addTo(map)
        .bindPopup('idDevice: '+data['entity_id']+'<br> Owner: '+data['owner'])
        .openPopup();
}