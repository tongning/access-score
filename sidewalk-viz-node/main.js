
var turfbuffer = require('turf-buffer');
var turfwithin = require('turf-within');
var turf = require('turf');
var labelfile = require('./labels');
var streetsfile = require('./streets');
var L = require('leaflet-headless');
var accessibilitylabels = labelfile.accessibilitylabels;
var streets = streetsfile.streets;

var amenitiesActive = true;
var pedestriansActive = false;
var debounceWait = 15;


var SurfaceProblem = L.geoJson(accessibilitylabels, { filter: surfaceProblemFilter }).toGeoJSON();

function surfaceProblemFilter(feature) {
    if (feature.properties.label_type === "SurfaceProblem") return true
}

var CurbRamp = L.geoJson(accessibilitylabels, { filter: curbRampFilter }).toGeoJSON();

function curbRampFilter(feature) {
    if (feature.properties.label_type === "CurbRamp") return true
}

var Obstacle = L.geoJson(accessibilitylabels, { filter: obstacleFilter }).toGeoJSON();

function obstacleFilter(feature) {
    if (feature.properties.label_type === "Obstacle") return true
}

var Other = L.geoJson(accessibilitylabels, { filter: otherFilter }).toGeoJSON();

function otherFilter(feature) {
    if (feature.properties.label_type === "Other") return true
}

var Occlusion = L.geoJson(accessibilitylabels, { filter: occlusionFilter }).toGeoJSON();

function occlusionFilter(feature) {
    if (feature.properties.label_type === "Occlusion") return true
}

var NoSidewalk = L.geoJson(accessibilitylabels, { filter: noSidewalkFilter }).toGeoJSON();

function noSidewalkFilter(feature) {
    if (feature.properties.label_type === "NoSidewalk") return true
}

var NoCurbRamp = L.geoJson(accessibilitylabels, { filter: noCurbRampFilter }).toGeoJSON();

function noCurbRampFilter(feature) {
    if (feature.properties.label_type === "NoCurbRamp") return true
}

/*
var amenities = [
    {name: 'metros', importance: 6.5, data: SurfaceProblem},
    {name: 'grocery', importance: 5, data: grocery},
    {name: 'pharmacies', importance: 4, data: pharmacies},
    {name: 'bikes', importance: 3, data: bikes},
    {name: 'bars', importance: 2.5, data: bars},
    {name: 'zipcar', importance: 3, data: zipcar},
    {name: 'libraries', importance: 1, data: libraries},
    {name: 'schools', importance: 1, data: schools},
    {name: 'postoffices', importance: .5, data: postoffices}
];

*/

var amenities = [
    /*
    {name: 'metros', importance: 6.5, data: CurbRamp},
    {name: 'grocery', importance: 5, data: NoCurbRamp},
    {name: 'pharmacies', importance: 4, data: Obstacle},
    {name: 'bikes', importance: 3, data: SurfaceProblem},
    {name: 'bars', importance: 2.5, data: Other},
    {name: 'zipcar', importance: 3, data: Occlusion},
    {name: 'libraries', importance: 1, data: NoSidewalk},
    { name: 'schools', importance: 1, data: streets }*/
];

var accFeatures = [

    { name: 'CurbRamp', importance: 6.5, data: CurbRamp },
    { name: 'NoCurbRamp', importance: 5, data: NoCurbRamp },
    { name: 'Obstacle', importance: 4, data: Obstacle },
    { name: 'SurfaceProblem', importance: 3, data: SurfaceProblem },
    { name: 'Other', importance: 2.5, data: Other },
    { name: 'Occlusion', importance: 3, data: Occlusion },
    { name: 'NoSidewalk', importance: 1, data: NoSidewalk }

];

var pt = {
    "type": "Feature",
    "properties": {
        "marker-symbol": "pitch",
        "marker-color": "#fff",
        "marker-size": "small",
        "stroke": "#000"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [
            -77.0323696732521,
            38.91326933963583
        ]
    }
};




walkability();

function walkability() {


    var score = 0;
    var categories


    amenities.forEach(function (amenity) {
        amenity.data.features.forEach(function (f) {
            f.properties.score = null;
        });
    });


    /*
    console.log("amenitieszerodatafeatures")
    console.log(amenities[0].data.features)*/
    var count = 0
    obs_counts = [];
    var curr_cell = 0;
    for (var streetline of streets) {
        //console.log("streetline");
        //console.log(streetline)
        curr_cell++;

        //console.log("Processing cell "+curr_cell+" of "+streets.length+" cells.");

        var lengthInCell = 0
        for (var route of streetline.features) {
            lengthInCell += route.properties.length;
        }
        obs_counts.push({
            'CurbRamp': [0, 0, 0, 0, 0],
            'NoCurbRamp': [0, 0, 0, 0, 0],
            'Obstacle': [0, 0, 0, 0, 0],
            'SurfaceProblem': [0, 0, 0, 0, 0],
            'Other': [0, 0, 0, 0, 0],
            'Occlusion': [0, 0, 0, 0, 0],
            'NoSidewalk': [0, 0, 0, 0, 0],
            'length': lengthInCell
        });
        
        //var street = turf.featurecollection([turfbuffer(streetline, 0.06, 'miles')]);
        var street = turfbuffer(streetline, 0.03, 'miles');
        //console.log("streetarea")
        //console.log(JSON.stringify(street));
        //console.log(street)
        //var point = turf.point([-90.548630, 14.616599]);
        //var street = turf.buffer(point, 0.06, {units: 'miles'});
        count++;
        //if(count > 10) {
        //    break
        //}
        try {
            for (var featurecategory of accFeatures) {
                count++;
                var featuresinside;
                try {
                    featuresinside = turfwithin(featurecategory.data, street);
                }
                catch (err) {
                    continue;
                }

                for (var item of featuresinside.features) {
                    current_cell_obj = obs_counts[obs_counts.length - 1];
                    current_cell_obj[item.properties.label_type][item.properties.severity - 1]++;
                }
            }
        } catch(err) {
            console.log(err);
        }





    }
    output = {}
    output['data'] = obs_counts
    console.log(JSON.stringify(output))





}

// taken from underscore http://underscorejs.org/
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};



