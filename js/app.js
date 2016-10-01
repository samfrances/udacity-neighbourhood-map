// Retrieve JSON list of locations from server

/**
 * ViewModel 'class' reprenting list of locations
 */
var LocationsVM = (function() {

    /**
     * @constructor
     */
    function LocationsVM() {
        var self = this;
        $.getJSON("data/data.json", function(data) {
            self.locations = processLocationsData(data);
        })
    }

    // Private helper functions

    /**
     * Processes the list of JSON objects returned by the AJAX request
     * in the LocationsVM constructor, and returns a list of google.maps.Marker
     * objects, as yet with no attachment to any map.
     *
     * @param {Array} locationsData - an array of objects detailing locations
     * @return {Array.<google.maps.Marker>}
     */
    function processLocationsData(locationsData) {
        return locationsData.map(function(location, i) {
            var marker =  new google.maps.Marker({
                position: location.location,
                title: location.title,
                animation: google.maps.Animation.DROP,
                id: i,
            });
            return marker;
        })
    }

    return LocationsVM;

})();


var vm;

var map;
function initMap() {
// Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.390205, lng: 2.154007},
        zoom: 13,
        mapTypeControl: false, // Remove controls from top left corner of map
    });

    // KO Experimentation REMOVE_COMMENT
    vm = new LocationsVM();
}