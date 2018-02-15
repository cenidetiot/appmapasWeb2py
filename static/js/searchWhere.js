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
var map,map2,map3;
var isOnCampus = false;

//HIDE ELEMNTS
//$("#dateTimeInput").show();
$("#FormGroup2").hide();

/*$("#was").click (function hideFormGroup1(event){
    event.preventDefault();
    $("#FormGroup2").hide();
    $("#FormGroup1").show();
});
$("#are").click (function hideFormGroup2(){
    event.preventDefault();
});*/
//SELECTOR CHANGE VALUE: NAME=SELECTOR SEARCH
$('select[name=optionsView]').change(function() {
    let value = $(this).val()
    if(value==="who-was"){
        $("#FormGroup2").hide();
        $("#FormGroup1").show();
    }
    else if(value==="who-are"){
        $("#FormGroup1").hide();
        $("#FormGroup2").show();
    }
    else if(value === ""){
        alert("Select an option view");
    }
    console.log($(this).val())
});

//MAP CONTAINER 
map = L.map("mapid").setView([0,0], 2);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
            console.log("No se encontró información del campus");
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
            polyline = L.polyline(campusData.location, {color: '#ff6666'}).addTo(map);
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
valueSelectorParameterSearch = $('select[name=selectorparameterSearch]').val()
console.log("value select date: "+valueSelectorParameterSearch);
//SELECTOR CHANGE VALUE: NAME= SELECTOR PARAMETER SEARCH
/*$('select[name=selectorparameterSearch]').change(function() {
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
});*/
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
async function searchingUserInCampus(locationCoordinates){
    console.log(locationCoordinates.join(","))
    console.log(campusLocation.join(";"));
    let query = {
        point: locationCoordinates.join(","),
        polygon: campusLocation.join(";")
    }
    /*let query = {
        point: "18.879683, -99.221627",
        polygon: "18.87995433844068,-99.2219396866858;18.87998986907176,-99.22182166948915;18.87991373199594,-99.22162855044007;18.87967516893432,-99.22142470255497;18.879385847318705,-99.22103846445683;18.879380771496425,-99.22088289633396;18.879243724236808,-99.22103310003877;18.87901531188834,-99.22112965956333;18.878832581785367,-99.22118866816163;18.87869045823416,-99.22120476141575;18.878553410409896,-99.22126377001405;18.878477272681298,-99.2213442362845;18.878665079015903,-99.22130132094026;18.878771671706748,-99.22146761789918;18.878898567678874,-99.22155344858766;18.879035615220808,-99.22143006697297;18.879137131846274,-99.22143006697297;18.879304634143818,-99.22147298231724;18.879395998962796,-99.22156417742372;18.87947721209341,-99.22164464369416;18.879680244747682,-99.22196114435792;18.879827443268194,-99.22200405970219;18.87995433844068,-99.2219396866858"
    } */   
    await $.ajax({  
        url:'https://driving-monitor-service.herokuapp.com/api/pointCampus',
        data: query,
        type:'POST',
        dataType: "json",
        success:function (respuesta) {   
            isOnCampus= respuesta.isOnCampus;
            console.log(isOnCampus);
            return;
        }
    }); 
    console.log(isOnCampus);
   /* $.post("",query,function(data, status){
        window.isOnCampus = data['isOnCampus'];
        console.log(data['isOnCampus']);       
    });
    console.log(window.isOnCampus);*/
    if(isOnCampus){
        return true;
    }
    else{
        return false;
    }
}
function searchingOwnerDevice(){
    console.log("value date:"+valueSelectorParameterSearch);
    if(valueSelectorParameterSearch === "date"){
        date = $("#dateInput").val();
        let dateUTC = new Date(date).toISOString();
        console.log(dateUTC);
        console.log(date);
        $.get("https://cratedrivingapp-service.herokuapp.com/api/locationOwnerDate?owner="+searchParameter+"&date="+date, function(data){
            if(data.length===0){
                console.log("No se encontraron registros del dispositivos con owner: "+searchParameter+" en la fecha especificada: "+date);
                alert("No se encontraron registros del dispositivo con owner: "+searchParameter+" en la fecha especificada: "+date);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived);
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                let recibi = searchingUserInCampus(locationCoordinates);
                recibi.then(function(result) {
                    console.log("here results");
                    console.log(result) //will log results.
                    if(result){
                        showMap(locationCoordinates, dataReceived);
                    }
                    else{
                        alert("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                        console.log("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                    }   
                 })
                //console.log(recibi);
                /*if(recibi){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                    console.log("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                } */ 
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
                console.log("No se encontraron registros del dispositivo con owner: "+searchParameter+" en la fecha y hora especificada: "+dateTime);
                alert("No se encontraron registros del dispositivo con owner: "+searchParameter+" en la fecha y hora especificada: "+dateTime);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived);
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                let recibi = searchingUserInCampus(locationCoordinates);
                recibi.then(function(result) {
                    console.log("here results");
                    console.log(result) //will log results.
                    if(result){
                        showMap(locationCoordinates, dataReceived);
                    }
                    else{
                        alert("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha y hora: "+dateTime);
                        console.log("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fechay hora: "+dateTime);
                    }           
                        
                /*if(searchingUserInCampus(locationCoordinates)){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha y hora: "+dateTime);
                    console.log("El usuario con id: "+searchParameter+" no se encontró en la zona del campus especificado en la fechay hora: "+dateTime);
                } */          
                })
            }
        });
    }
    else{
        alert("You need to specify a parameter of search");
        console.log("You need to specify a parameter of search");
    }
}
function searchingIDDevice(){
    if(valueSelectorParameterSearch === "date"){
        var date = $("#dateInput").val();
        console.log(date);
        $.get("https://cratedrivingapp-service.herokuapp.com/api/locationDeviceDate?idDevice="+searchParameter+"&date="+date, function(data){
            if(data.length===0){
                console.log("No se encontraron registros del dispositivo con idDevice: "+searchParameter+" en la fecha especificada: "+date);
                alert("No se encontraron registros del dispositivo con idDevice: "+searchParameter+" en la fecha especificada: "+date);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived);
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                let recibi = searchingUserInCampus(locationCoordinates);
                recibi.then(function(result) {
                    console.log("here results");
                    console.log(result) //will log results.
                    if(result){
                        showMap(locationCoordinates, dataReceived);
                    }
                    else{
                        alert("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                        console.log("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                    }     
                })
                /*if(searchingUserInCampus(locationCoordinates)){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                    console.log("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha: "+date);
                }          */ 
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
                console.log("No se encontraron registros del dispositivo con el iDevice: "+searchParameter+"en la fecha y hora especificados: "+dateTime);
                alert("No se encontraron registros del dispositivo con el iDevice: "+searchParameter+"en la fecha y hora especificados: "+dateTime);
            }
            else{
                let dataReceived = JSON.stringify(data[0]);
                console.log("Data: " + dataReceived); 
                locationCoordinates[0] = data[0]['location'][1];
                locationCoordinates[1] = data[0]['location'][0];
                console.log("Location: " + locationCoordinates);
                let recibi = searchingUserInCampus(locationCoordinates);
                recibi.then(function(result) {
                    console.log("here results");
                    console.log(result) //will log results.
                    if(result){
                        showMap(locationCoordinates, dataReceived);
                    }
                    else{
                        alert("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha y hora especificada: "+dateTime);
                        console.log("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha y hora especificada: "+dateTime);
                    }    
                })
                /*if(searchingUserInCampus(locationCoordinates)){
                    showMap(locationCoordinates, dataReceived);
                }
                else{
                    alert("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha y hora especificada: "+dateTime);
                    console.log("El usuario con idDevice: "+searchParameter+" no se encontró en la zona del campus especificado en la fecha y hora especificada: "+dateTime);
                }*/           
            }
        });     
    }
    else{
        alert("You need to specify a parameter of search");
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
    polyline = L.polyline(campusData.location).addTo(map);
    /*var editableLayers = new L.FeatureGroup();

    map3.addLayer(editableLayers);

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
    map.addControl(drawControl);*/

    L.marker(location).addTo(map)
        .bindPopup('idDevice: '+data['entity_id']+'<br> Owner: '+data['owner'])
        .openPopup();
}