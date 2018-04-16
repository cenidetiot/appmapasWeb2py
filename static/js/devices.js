//Variables
var date,dateTime, dateUTC, timeHour = "";
var hour = "";
var phonenumber = null;
var zoneLocation,dateTimeSplit = [];
var isOnCampus = false;

//HIDE ELEMNTS
$("#FormGroup2").hide();
$("#FormGroup3").hide();

//SELECTOR CHANGE VALUE: NAME=SELECTOR SEARCH
$('select[name=optionsView]').change(function() {
    let value = $(this).val()
    if(value==="who-was"){
        $("#FormGroup2").hide();
        $("#FormGroup1").show();
        $("#FormGroup3").hide();
    }
    else if(value==="who-is"){
        $("#FormGroup1").hide();
        $("#FormGroup2").show();
        $("#FormGroup3").hide();
    }
    else if (value==="devices-in-zone"){
        $("#FormGroup1").hide();
        $("#FormGroup2").hide();
        $("#FormGroup3").show();
    }
    else if(value === ""){
        alert("Select an option view");
    }
    console.log($(this).val())
});

//MAP CONTAINER 
map = L.map("mapid").setView([0,0], 2);

// MAPBOX STYLE ON THE MAP
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA'
}).addTo(map);

//GET ALL ZONES REGISTERED
$.get("https://smartsecurity-webservice.herokuapp.com/api/zone", function(data){
    if(data.length===0){
        console.log("No se encontraron campus ");
    }
    else{
        campus = data;
        campus.forEach(element => {
            $('#zonelist1').append($('<option>', {
                value: element['idZone'],
                text: element['name']
            })); 
            $('#zonelist2').append($('<option>', {
                value: element['idZone'],
                text: element['name']
            })); 
            $('#zonelist3').append($('<option>', {
                value: element['idZone'],
                text: element['name']
            })); 
        });
    }
});

//SELECTOR CHANGE VALUE: NAME=SELECTOR ZONE
$('#zonelist1').change(function() {
    let idZone = $(this).val()
    //GET ALL INFORMATION OF A SPECIFIC CAMPUS
    $.get("https://smartsecurity-webservice.herokuapp.com/api/zone/"+idZone, function(data){
        if(data.length===0){
            console.log("No se encontró información del campus");
        }
        else{
            console.log(data);
            zoneLocation = data['location'];
            map.setView(new L.LatLng(data['centerPoint'][0], data['centerPoint'][1]), 18);
            polyline = L.polyline( data['location'], {color: '#ff6666'}).addTo(map);
        }
    });
});
function searching1(){
    //GET DATE AND HOUR FROM INPUTS
    date = $("#dateInput").val();
    console.log(date);
    hour = $('#timeInput').val();
    console.log(hour);
    //CONCATENATE DATE AND TIME
    dateTime = date+"T"+hour+":00:00.000Z";
    console.log(dateTime);
    //DATE UTC
    dateUTC = new Date(dateTime).toISOString();
    console.log(dateUTC);
    //ARRAY DATETIME
    dateTimeSplit = dateUTC.split("T");
    console.log(dateTimeSplit);

    timeHour = dateTimeSplit[1].substring(0,2);
    console.log(timeHour);

    //PHONE NUMBER FORM INPUT
    phonenumber = $('#phonenumber-input').val();
    console.log(phonenumber);
    searchUserInfo(phonenumber);
    return;
}
function searchUser(userData){
    $.get("https://smartsecurity-webservice.herokuapp.com/crate/locationOwnerDateTime?owner="+userData[0]['id']+"&date="+dateTimeSplit[0]+"&time="+timeHour, function(data){
        if(data.length===0){
            console.log("No se encontraron registros con el Usuario: "+userData[0]['firstName']+" en la fecha y hora especificados: "+date+" "+hour+" hours");
            alert("No se encontraron registros con el Usuario: "+userData[0]['firstName']+" en la fecha y hora especificados: "+date+" "+hour+" hours");
        }
        else{
            console.log(data);
            let searchUserinCampus = searchingUserInCampus(data[0]['location']);
            searchUserinCampus.then(function(result) {
                console.log("here results");
                console.log(result) //will log results.
                if(result){
                    showMap(locationCoordinates, data);
                }
                else{
                    alert("El usuario: "+userData[0]['firstName']+" no se encontró en la zona  en la fecha y hora especificada: "+date+" "+hour+" hours");
                    console.log("El usuario: "+userData[0]['firstName']+" no se encontró en la zona en la fecha y hora especificada: " +date+" "+hour+" hours");
                }    
            }) 
        }
    }); 
}
async function searchingUserInCampus(locationCoordinates){
    console.log(locationCoordinates)
    console.log(zoneLocation);
    let query = {
        point: locationCoordinates,
        polygon: zoneLocation
    }
    await fetch("https://smartsecurity-webservice.herokuapp.com/service/zone/point", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods':'POST'
        },
        body : JSON.stringify(query)
    })
    .then((res) => {
        res.json()
        console.log(res)
        if(res.status != 200){
            alert("An error has ocurred to search the user in the zone");
            return;
        }
    })
    .then((data)=> {
        if(data){
            console.dir(data)
            isOnCampus = data.inzone;
            console.log(isOnCampus);
            return
        }
    })
    if(isOnCampus){
        return true;
    }
    else{
        return false;
    };
}

function searchUserInfo(phoneNumber){
    console.log(phoneNumber);
    fetch("https://smartsecurity-webservice.herokuapp.com/api/user?phoneNumber="+phoneNumber, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET, POST, OPTIONS, PUT, PATCH, DELETE'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.dir(data)
        if(data){
            searchUser(data);
        }
    })
    .catch((error)=>{
        console.log(error);
    })
}

/*function showMap(location, dataReceived){
    console.log(location);
    let data = JSON.parse(dataReceived);
    console.dir(data);
    //===============================DATE BLOCK====================================
    //MEXICO TIMEZONE
    moment.tz.add("America/Mexico_City|LMT MST CST CDT CWT|6A.A 70 60 50 50|012121232324232323232323232323232323232323232323232323232323232323232323232323232323232323232323232|-1UQF0 deL0 8lc0 17c0 10M0 1dd0 gEn0 TX0 3xd0 Jb0 6zB0 SL0 e5d0 17b0 1Pff0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|20e6");
    //ZURICH TIMEZONE
    //moment.tz.add("Europe/Zurich|CET CEST|-10 -20|01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-19Lc0 11A0 1o00 11A0 1xG10 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|38e4"):
    let date = data['time_index'];
    let dateUnFormatted = moment.tz(date,'America/Mexico_City');
    // DATE ZÚRICH
    //let dateUnFormatted = moment.tz(date,'Europe/Zurich');
    let dateFormated = dateUnFormatted.format();

    console.log(dateFormated);
    map.setView(new L.LatLng(location[0], location[1]), 18);
    polyline = L.polyline(campusData.location).addTo(map);
    $("#text-whowascard").html("ID device: "+data['entity_id']+'<br> Owner: '+data['owner']+'<br> DateTime: '+dateFormated);
    L.marker(location).addTo(map)
        .bindPopup('idDevice: '+data['entity_id']+'<br> Owner: '+data['owner']+'<br> DateTime: '+dateFormated)
        .openPopup();
}*/