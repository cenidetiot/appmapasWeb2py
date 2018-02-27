
var valueSelectorSearch2 = "";
var campusData;
var campusLocation = [];
var campusLatitude;
var campusLongitude;

var dt = luxon.DateTime.local();
let fifteenAgo = dt.minus({ minutes: 15 });

console.log("OK")

map.remove();
map = L.map("mapid").setView([0, 0], 2);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

getCampus();
//SELECTOR CHANGE VALUE: NAME=SELECTOR ZONE
$('select[name=campuslist]').change(function() {
    let idCampus = $(this).val()
    $( "#campuslist option:selected" ).each(function() {
        if($( this ).val() === "Select an option")
            window.campusSelected =undefined;
        else
            window.campusSelected = $( this ).val() ;
      });

    //GET ALL INFORMATION OF A SPECIFIC CAMPUS
    $.get("https://driving-monitor-service.herokuapp.com/api/campus/"+window.campus[window.campusSelected]._id, function(data){
        if(data.length===0){
            console.log("No se encontró información del campus");
        }
        else{
            campusData = data;
            campusLocation = data['location'];
            campusLatitude = data['pointMap'][0]['latitude'];
            campusLongitude = data['pointMap'][0]['longitude'];
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
$('select[name=selectorSearch2]').change(function() {

    valueSelectorSearch2 = $(this).val()
    if(valueSelectorSearch2==="idDevice"){
        $("#label-input-search2").html("ID Device: ");
    }
    else if(valueSelectorSearch2==="owner"){
        $("#label-input-search2").html("Owner: ");
    }
    else if(valueSelectorSearch2==="username"){
        $("#label-input-search2").html("Username: ");
    }
    console.log($(this).val())
});

function getCampus(){
    $.ajax({  
        url:'https://driving-monitor-service.herokuapp.com/api/campus',
        type:'GET',
        dataType: "json",
        success:function (respuesta) {
            window.campus = respuesta;
            respuesta.map((campus , index)=>{
                //polyline = L.polyline(campus.location, {color: 'red'}).addTo(map);
                //console.log(campus.location.join(";"))
                $('#campuslist').append($('<option>', {
                    value: index,
                    text: campus.name
                }));
            })
        }
    });
}
function searching2(){
    searchParameter2 = $('#input-search2').val();
    console.log(searchParameter2);
    if(searchParameter2!=null){
        if(valueSelectorSearch2==="idDevice"){
            searchingIDDevice2(`${$('#input-search2').val()}`);
        }
        else if(valueSelectorSearch2==="owner"){
            searchingOwnerDevice2(`${$('#input-search2').val()}`);
        }
        else if(valueSelectorSearch2==="username"){
            searchingUsername2(`${$('#input-search2').val()}`);
        }
    }
    else{
        console.log("You need to specify a option search ");
    }
}  
function drawMarkers (data, popMessage) {
    map.remove();
    map = L.map("mapid").setView([campusLatitude, campusLongitude], 19);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    polyline = L.polyline(campusData.location).addTo(map);
    console.log("Campus" ,window.campus[window.campusSelected])
    if (window.campusSelected !== undefined){
        console.log(window.campusSelected)
        data.georel ="coveredBy";
        data.geometry="polygon";
        console.log(window.campus)
        data.coords = window.campus[window.campusSelected].location.join(';');   
        data.dateModified=`>=${fifteenAgo}`;
    }
    $.ajax({  
        url:'https://driving-monitor-service.herokuapp.com/api/query',
        data: data,
        type:'POST',
        dataType: "json",
        success:function (respuesta) {            
            if(respuesta.length < 1){
                alert("El usuario especificado no se encuentra en el campus seleccionado.");
                console.log("No se encuentra")
            }
            respuesta.map( (device) => {
                //==========================DATE BLOCK================================
                //MEXICO TIMEZONE
                //moment.tz.add("America/Mexico_City|LMT MST CST CDT CWT|6A.A 70 60 50 50|012121232324232323232323232323232323232323232323232323232323232323232323232323232323232323232323232|-1UQF0 deL0 8lc0 17c0 10M0 1dd0 gEn0 TX0 3xd0 Jb0 6zB0 SL0 e5d0 17b0 1Pff0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|20e6");
                
                //ZURICH TIMEZONE
                //moment.tz.add("Europe/Zurich|CET CEST|-10 -20|01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-19Lc0 11A0 1o00 11A0 1xG10 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|38e4"):
                //let date = device['dateModified'];
                //let dateUnFormatted = moment.tz(date,'America/Mexico_City');
                //DATE ZÚRICH
                //let dateUnFormatted = moment.tz(date,'Europe/Zurich');
                //let dateFormated = dateUnFormatted.format();  
                //console.log(dateFormated);              
                let coordinates = device.location.split(",");
                $("#text-whoarecard").html("ID device: "+device['id']+'<br> Owner: '+device['owner']+'<br> DateTime: '+device['dateModified']);
                L.marker(coordinates).addTo(map)
                .bindPopup('idDevice: '+device.id+'<br> Owner: '+device.owner+'<br> DateTime: '+device['dateModified'])
                //.bindPopup(device.id + "<br> " + device.owner)
                .openPopup();
            })
        }
    }); 
}
function searchingIDDevice2(idDevice){
    let id = ""
    if (idDevice === ""){
        id = "Device_Smartphone_.*"
    }
    else {
        id = idDevice
    }
    let data = {
        "id": id,
      "type": "Device",
      "options": "keyValues"
    };
    drawMarkers(data, id);
}
function searchingOwnerDevice2(owner, pop){
    let data  = {
        "id": "Device_Smartphone_.*",
        "type": "Device",
        "owner" : owner,
        "options": "keyValues"
    }
    if (pop === undefined){
        pop = owner;
    }
    drawMarkers(data, pop); 
}
function searchingUsername2(username){
    let nameArray = username.split(" ");
    console.log(nameArray);
    let first_name = nameArray[0];
    let last_name = nameArray[1];
    let url = `https://smartsdk-web-service.herokuapp.com/api/user?first_name=${first_name}&last_name=${last_name}`
    $.ajax({  
        url:url,
        type:'GET',
        dataType: "json",
        success:function (respuesta) {
            console.log(respuesta.id);
            searchingOwnerDevice2(`User:${respuesta.id}`, username) 
        }
    });

}

    