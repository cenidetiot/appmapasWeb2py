$(function ($) {
    console.log("OK")
    var iconPerson = L.icon({
        iconUrl: '../static/images/person.png',
        iconSize: [50, 50],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowAnchor: [22, 94]
    });
    var iconDevice = L.icon({
        iconUrl: '../static/images/device.png',
        iconSize: [50, 50],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowAnchor: [22, 94]
    });

    function getCampus(){
        $.ajax({  
            url:'https://driving-monitor-service.herokuapp.com/api/campus',
            type:'GET',
            dataType: "json",
            success:function (respuesta) {
                window.campus = respuesta;
                respuesta.map((campus , index)=>{
                    polyline = L.polyline(campus.location, {color: 'red'}).addTo(map);
                    //console.log(campus.location.join(";"))
                    $('#campuslist').append($('<option>', {
                        value: index,
                        text: campus.name
                    }));
                })
            }
        });
    }

    $( "#campuslist" ).change(function() {
        
    })

    //SELECTOR CHANGE VALUE: NAME=SELECTOR ZONE
    $('select[name=campuslist]').change(function() {
        let idCampus = $(this).val()
        console.log("hellllooo")
        $( "#campuslist option:selected" ).each(function() {
            if($( this ).val() === "Choose the campus...")
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

    function drawMarkers (data, type , popMenssage) {
        console.log("Campus" ,window.campus[window.campusSelected])
        if (window.campusSelected !== undefined){
            console.log(window.campusSelected)
            data.georel ="coveredBy";
            data.geometry="polygon";
            console.log(window.campus)
            data.coords = window.campus[window.campusSelected].location.join(';');
            
        }

        let icon = null;
        if (type === "Person"){
            icon = iconPerson ;
        }else{
            icon = iconDevice;
        }

        $.ajax({  
            url:'https://driving-monitor-service.herokuapp.com/api/query',
            data: data,
            type:'POST',
            dataType: "json",
            success:function (respuesta) {
                
                if(respuesta.length < 1){
                    alert("El usuario especificado no se encuentra en el campus seleccionado.");
                    console.log("No se encontró")
                }
                respuesta.map( (device) => {
                    let coordinates = device.location.split(",");
                    L.marker(coordinates,{icon : icon}).addTo(map)
                    .bindPopup(device.id + "<br> " + device.owner)
                    .openPopup();
                })
            }
        }); 

    }
    

    function getDeviceByOwner(owner, pop){

        let data  = {
            "id": "Device_Smartphone_.*",
            "type": "Device",
            "owner" : owner,
            "options": "keyValues"
        }
        if (pop === undefined){
            pop = owner;
        }
        drawMarkers(data, "Person", pop);
          
    }

    $( "#campuslist" ).change(function() {
        $( "#campuslist option:selected" ).each(function() {
            if($( this ).val() === "Choose the campus...")
                window.campusSelected =undefined;
            else
                window.campusSelected = $( this ).val() ;
          });
    })
    
    $( "#deviceButton" ).click(function() {
 
        
        let id = ""
        if ($("#idDevice").val() === ""){
            id = "Device_Smartphone_.*"
        }
        else {
            id = $("#idDevice").val()
        }
        let data = {
            "id": id,
          "type": "Device",
          "options": "keyValues"
        };
        drawMarkers(data, "Device", id);

        
    });

    $( "#userIdButton" ).click(function() {

        getDeviceByOwner(`${$("#userid").val()}`) 

    })


    $( "#nameButton" ).click(function() {
        let nameArray = $("#name").val().split(" ");
        let first_name = nameArray[0];
        let last_name = nameArray[1];
        let url = `https://smartsdk-web-service.herokuapp.com/api/user?first_name=${first_name}&last_name=${last_name}`
        $.ajax({  
            url:url,
            type:'GET',
            dataType: "json",
            success:function (respuesta) {
                getDeviceByOwner(`User:${respuesta.id}`, $("#name").val()) 
            }
        });
    })

    map.remove();
    map = L.map("mapid").setView([0, 0], 2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);



    getCampus();
    
    /*var coordinatesConverted = []; 
    var polylineArrayCoordinates = [];
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

    

    map.on('draw:created', function (e) {
    var type = e.layerType;
    console.log(type);
    var layer = e.layer;
    if (type === 'marker'){
            console.log("CREANDO MARCADOR");
            let coordinates = layer.getLatLng();
            console.log(coordinates);
        }
        if (type === 'polygon') {
            console.log("CREANDO POLÍGONO");
            var polygon = layer.toGeoJSON();
            var polygonCoordinates = polygon['geometry']['coordinates'];

            //CONVERT COORDINATES [LON,LAT] GeoJSON IN [LAT,LON] COORDINATES.
            for(let i=0; i<polygonCoordinates.length;i++){
            for(let j=0; j<polygonCoordinates[i].length;j++){
                coordinatesConverted.push([polygonCoordinates[i][j][1],polygonCoordinates[i][j][0]]);         
            }
            }
            console.log(JSON.stringify(polygon));
            console.log(polygonCoordinates);
            console.log("Coordenadas  [lat,long] del polígono ");
            console.log(coordinatesConverted);   
        }
        if(type === 'polyline'){
            console.log("CREANDO POLILÍNEA");
            var polylineCoordinates = layer.getLatLngs();
            //CONVERT POLYLINE COORDINATES INTO ARRAY OF COORDINATES 
            polylineCoordinates.forEach(element => {
                polylineArrayCoordinates.push([element['lat'],element['lng']])
            });
            console.log(polylineCoordinates);
            console.log(polylineArrayCoordinates);
        }
        if(type === 'rectangle'){
            console.log("CREANDO RECTANGULO");
        }
    // Do whatever else you need to. (save to db; add to map etc)
    editableLayers.addLayer(layer);
    //drawnItems.addLayer(layer);
    });*/

});
