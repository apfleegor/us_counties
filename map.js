
// color picking website:
// https://colorbrewer2.org/#type=sequential&scheme=BuGn&n=5

var livedColor = '#a50f15';
// var travelingColor = '#66c2a4';
// var oneDayColor = '#2ca25f';
// var oneWeekColor = '#006d2c';
// var moreColor = '#112a12';


var travelingColor = '#74a9cf';
var oneDayColor = '#2b8cbe';
var oneWeekColor = '#045a8d';
var moreColor = '#000435';
// var linesColor = '#b2e2e2';
var linesColor = '#969696';

// conversion from the state abbreviation to the state fp number
var state_to_statefp = {
    'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06', 'CO': '08',
    'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12', 'GA': '13', 'HI': '15', 
    'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19', 'KS': '20', 'KY': '21',
    'LA': '22', 'ME': '23', 'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27',
    'MS': '28', 'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
    'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39',
    'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45', 'SD': '46',
    'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50', 'VA': '51', 'WA': '53',
    'WV': '54', 'WI': '55', 'WY': '56'
}


// traveled through counties
var traveling_counties = {
    'name': 'traveling_counties',
    'type': "FeatureCollection",
    features: []
};

// lived in counties
var lived_counties = {
    'name': 'lived_counties',
    'type': "FeatureCollection",
    features: []
};

// less than one day counties
var one_day_counties = {
    'name': 'one_day_counties',
    'type': "FeatureCollection",
    features: []
};

// less than one week counties
var one_week_counties = {
    'name': 'one_week_counties',
    'type': "FeatureCollection",
    features: []
};

// more than one week counties
var more_counties = {
    'name': 'more_counties',
    'type': "FeatureCollection",
    features: []
};



fetch('./data/data.json')
    .then((response) => response.json())
    .then((json) => {
        console.log(json)
        console.log(json['lived_list'])

        var traveling_list = json['traveling_list'];
        var lived_list = json['lived_list'];
        var one_day_list = json['one_day_list'];
        var one_week_list = json['one_week_list'];
        var more_list = json['more_list'];


        getFeatures(traveling_counties, traveling_list);
        getFeatures(lived_counties, lived_list);
        getFeatures(one_day_counties, one_day_list);
        getFeatures(one_week_counties, one_week_list);
        getFeatures(more_counties, more_list);


        createMap();

    }

)




function getFeatures(updated_counties, counties_list) {
    all_counties['features'].forEach(element => {
        counties_list.forEach(county => {
            if (element['properties']['NAME'] == county['county']) {
    
                if (element['properties']['STATEFP'] == state_to_statefp[county['state']]) {
                    updated_counties.features.push(element);
                }
            }
        })
    });
}

function addPopUpMap(layer_name, map) {

    map.on('click', layer_name, (e) => {
        new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties['NAME'])
            .addTo(map);
    })

    // Change the cursor to a pointer when the mouse is over the layer.
    map.on('mouseenter', layer_name, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', layer_name, () => {
        map.getCanvas().style.cursor = '';
    });

}


function addPolygonsMap(layer_name, map, data, color) {
    map.addSource(layer_name, {
        'type': 'geojson',
        'data': data
    })

    map.addLayer({
        'id': layer_name,
        'type': 'fill',
        'source': layer_name,
        'layout': {},
        'paint': {
            'fill-color': color,
            'fill-opacity': 0.6
        }
    })
}



function createMap() {

    const map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                osm: {
                    type: 'raster',
                    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap Contributors',
                    maxzoom: 19
                },
                
            },
            layers: [
                {
                    id: 'osm',
                    type: 'raster',
                    source: 'osm'
                },
                
            ],
            },
        center: [-104, 39],
        zoom: 3
    });

    map.on('load', async () => {
        map.addSource('counties', {
            'type': 'geojson',
            'data': all_counties
        })
    
        map.addLayer({
            'id': 'counties',
            'type': 'line',
            'source': 'counties',
            'layout': {},
            'paint': {
                'line-color': linesColor,
                'line-width': 0.4
            }
        })

        addPolygonsMap('counties_traveled', map, traveling_counties, travelingColor);
        addPolygonsMap('counties_lived', map, lived_counties, livedColor);
        addPolygonsMap('counties_one_day', map, one_day_counties, oneDayColor);
        addPolygonsMap('counties_one_week', map, one_week_counties, oneWeekColor);
        addPolygonsMap('counties_more', map, more_counties, moreColor);

        addPopUpMap('counties_traveled', map);
        addPopUpMap('counties_lived', map);
        addPopUpMap('counties_one_day', map);
        addPopUpMap('counties_one_week', map);
        addPopUpMap('counties_more', map);


    })
    
}






