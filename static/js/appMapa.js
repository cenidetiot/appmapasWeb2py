/*var map = L.map("mapid").setView([18.876551, -99.220100], 19);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var coordinatesConverted = []; 
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

L.marker([18.876551, -99.220100]).addTo(map)
    .bindPopup('CENIDET.<br> CAMPUS PALMIRA.')
    .openPopup();

/*map.on('draw:created', function (e) {
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
