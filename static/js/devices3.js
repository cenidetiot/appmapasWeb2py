//SELECTOR CHANGE VALUE: NAME=SELECTOR ZONE
$('#zonelist3').change(function() {
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

function searching3(){
    console.log($("#zonelist3").val());
    fetch("https://smartsecurity-webservice.herokuapp.com/service/devices/zone/"+$("#zonelist3").val(), {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Methods':'GET, POST, OPTIONS, PUT, PATCH, DELETE'
        },
    })
    .then((res) => res.json())
    .then((data)=> {
        console.dir(data)   
    })
    .catch((error)=>{
        console.log(error);
    })
}