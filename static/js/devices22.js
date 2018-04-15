$.get("https://smartsecurity-webservice.herokuapp.com/api/zone", function(data){
    if(data.length===0){
        console.log("No se encontraron campus ");
    }
    else{
        campus = data;
        campus.forEach(element => {
            $('#zonelist').append($('<option>', {
                value: element['idZone'],
                text: element['name']
            })); 
        });
    }
});
//SELECTOR CHANGE VALUE: NAME=SELECTOR ZONE
$('#zonelist').change(function() {
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

function searching2(){
    let phone = $('#input-search2').val();
    console.log($("#zonelist").val());
    console.log(phone);
    fetch("https://smartsecurity-webservice.herokuapp.com/service/devices/zone/"+$("#zonelist").val()+"/owner?phoneNumber="+phone, {
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


    