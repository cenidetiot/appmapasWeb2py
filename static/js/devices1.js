//Variables
var date = "";
var hour = "";
var phonenumber = null;
var zoneLocation = [];
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
    date = $("#dateInput").val();
    console.log(date);
    let dateUTC = new Date(date).toISOString();
    console.log(dateUTC);
    hour = $('#timeInput').val();
    console.log(hour);
    phonenumber = $('#phonenumber-input').val();
    console.log(phonenumber);
    searchUserInfo(phonenumber);
    return;
}
/*function searchUser(userData){
    $.get("https://smartsecurity-webservice.herokuapp.com/crate/locationOwnerDateTime?owner="+userData[0]['id']+"&date="+date+"&time="+hour, function(data){
        if(data.length===0){
            console.log("No se encontraron registros con el Usuario: "+userData[0]['id']+"en la fecha y hora especificados: "+dateTime);
            alert("No se encontraron registros con el Usuario:: "+userData[0]['id']+"en la fecha y hora especificados: "+dateTime);
        }
        else{
            let searchUserinCampus = searchingUserInCampus(data['location']);
            searchUserinCampus.then(function(result) {
                console.log("here results");
                console.log(result) //will log results.
                if(result){
                    console.log("si");
                    showMap(locationCoordinates, data);
                }
                else{
                    alert("El usuario: "+idUser+" no se encontró en la zona especificada en la fecha y hora especificada");
                    console.log("El usuario: "+idUser+" no se encontró en la zona especificada en la fecha y hora especificada");
                }    
            }) 
        }
    }); 
}*/
/*async function searchingUserInCampus(locationCoordinates){
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
    .then((respuesta) => {
        if(respuesta.status != 201){
            alert("An error has ocurred to search the user in the zone");
        }
        else{
            console.log(respuesta);
            isOnCampus = respuesta.isOnCampus;
            console.log(isOnCampus);
            return;
        }
    })
    console.log(isOnCampus);
    if(isOnCampus){
        return true;
    }
    else{
        return false;
    };
}*/

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
            //searchUser(data);
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