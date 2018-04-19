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
            console.log(zoneLocation);
            map.setView(new L.LatLng(data['centerPoint'][0], data['centerPoint'][1]), 18);
            polyline = L.polyline( data['location'], {color: '#ff6666'}).addTo(map);
        }
    });
});

function showDevicesOnmap(dataDevices){
    markerLayer.clearLayers();
    map.removeLayer(markerLayer)
    if(dataDevices.length != 0){
        for(let i=0; i<dataDevices.length; i++){
            let locationTemp = dataDevices[i]['location'].split(",")
            console.log(locationTemp);
            map.setView(new L.LatLng(Number(locationTemp[0]), Number(locationTemp[1])), 19);
            polyline = L.polyline(zoneLocation).addTo(map);
            fetch("https://smartsecurity-webservice.herokuapp.com/api/user?id="+dataDevices[i]['owner'], {
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Methods':'GET, POST, OPTIONS, PUT, PATCH, DELETE'
                },
             })
            .then((res) => res.json())
            .then((dataUser)=> {
                console.dir(dataUser)
                if(dataUser){
                    var marker = L.marker(locationTemp).addTo(map)
                    .bindPopup('ID Device: '+dataDevices[i]['id']+'<br> Owner ID: '+dataDevices[i]['owner']+'<br> Name User: '+dataUser[0]['firstName']+ ' '+dataUser[0]['lastName']+'<br> Phone Number: +'+dataUser[0]['phoneNumber'])
                    .addTo(markerLayer);
                    markerLayer.addTo(map);
                }
            })
        }
    }
    else{
        alert("There is not any device on the institution zone")
    }
}
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
        showDevicesOnmap(data);   
    })
    .catch((error)=>{
        console.log(error);
    })
    return;
}