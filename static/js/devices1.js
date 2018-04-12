//Variables
var date = "";
var hour = "";
var phonenumber = null;
var zoneLocation = [];
var isOnCampus = false;

//HIDE ELEMNTS
//$("#dateTimeInput").show();
$("#FormGroup2").hide();

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

// MAPBOX STYLE ON THE MAP
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaGFpZGVlIiwiYSI6ImNqOXMwenczMTBscTIzMnFxNHVyNHhrcjMifQ.ILzRx4OtBRK7az_4uWQXyA'
}).addTo(map);

//GET ALL CAMPUS REGISTERED
$.get("https://smartsecurity-webservice.herokuapp.com/api/zone", function(data){
    if(data.length===0){
        console.log("No se encontraron campus ");
    }
    else{
        campus = data;
        campus.forEach(element => {
            $('#select-search-zone').append($('<option>', {
                value: element['idZone'],
                text: element['name']
            })); 
        });
    }
});

//SELECTOR CHANGE VALUE: NAME=SELECTOR ZONE
$('select[name=selectorZone]').change(function() {
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
    //console.log(idUser);
    /*$.get("https://smartsecurity-webservice.herokuapp.com/crate/locationOwnerDateTime?owner="+idUser+"&date="+date+"&time="+hour, function(data){
        if(data.length===0){
            console.log("No se encontraron registros con el Usuario: "+idUser+"en la fecha y hora especificados: "+dateTime);
            alert("No se encontraron registros con el Usuario:: "+idUser+"en la fecha y hora especificados: "+dateTime);
        }
        else{
            let searchUserinCampus = searchingUserInCampus(data['location']);
            searchUserinCampus.then(function(result) {
                console.log("here results");
                console.log(result) //will log results.
                if(result){
                    showMap(locationCoordinates, data);
                }
                else{
                    alert("El usuario: "+idUser+" no se encontró en la zona especificada en la fecha y hora especificada: "+dateTime);
                    console.log("El usuario: "+idUser+" no se encontró en la zona especificada en la fecha y hora especificada: "+dateTime);
                }    
            }) 
        }
    }); */
}

/*async function searchingUserInCampus(locationCoordinates){
    console.log(locationCoordinates.join(","))
    console.log(campusLocation.join(";"));
    let query = {
        point: locationCoordinates.join(","),
        polygon: campusLocation.join(";")
    }*/
    /*let query = {
        point: "18.879683, -99.221627",
        polygon: "18.87995433844068,-99.2219396866858;18.87998986907176,-99.22182166948915;18.87991373199594,-99.22162855044007;18.87967516893432,-99.22142470255497;18.879385847318705,-99.22103846445683;18.879380771496425,-99.22088289633396;18.879243724236808,-99.22103310003877;18.87901531188834,-99.22112965956333;18.878832581785367,-99.22118866816163;18.87869045823416,-99.22120476141575;18.878553410409896,-99.22126377001405;18.878477272681298,-99.2213442362845;18.878665079015903,-99.22130132094026;18.878771671706748,-99.22146761789918;18.878898567678874,-99.22155344858766;18.879035615220808,-99.22143006697297;18.879137131846274,-99.22143006697297;18.879304634143818,-99.22147298231724;18.879395998962796,-99.22156417742372;18.87947721209341,-99.22164464369416;18.879680244747682,-99.22196114435792;18.879827443268194,-99.22200405970219;18.87995433844068,-99.2219396866858"
    } */   
    /*await $.ajax({  
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
    if(isOnCampus){
        return true;
    }
    else{
        return false;
    }
}*/
function searchUserInfo(phoneNumber){
    fetch("https://smartsecurity-webservice.herokuapp.com/api/user?phoneNumber="+phoneNumber, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.dir(data)   
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