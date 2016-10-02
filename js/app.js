/**
 * Model class representing locations
 */
var Location = (function() {

    /**
     * @constructor
     * @param {Object} - Object literal with data relating to the location.
     *      {
     *           title: {string},
     *           id: {Number},
     *           location: {
     *              lat: {Number},
     *              lng: {Number}
     *           }
     *      }
     *
     */
    function Location(data) {
        this.title = data.title;
        this.id = data.id;
        this.location = data.location;
        this.marker =  new google.maps.Marker({
            position: data.location,
            title: data.title,
            animation: google.maps.Animation.DROP,
            id: data.id,
        });
    }

    return Location;
})();

/**
 * ViewModel 'class' reprenting list of locations
 */
var LocationsVM = (function() {

    /**
     * @constructor
     */
    function LocationsVM() {
        var self = this;

        this.locations = ko.observableArray(); // TODO: Does this need to be observable?
        this.filter = ko.observable("");

        // Credit (with modifications): See README, Third-party code [5]
        this.filteredLocations = ko.computed(function() {
            var filter = $.trim( self.filter().toLowerCase() );
            if (!filter) {
                return self.locations();
            } else {
                return ko.utils.arrayFilter(self.locations(), function(location) {
                    return (location.title.toLowerCase().indexOf(filter) !== -1);
                });
            }
        });
        // End credit

        this.loadData();
    }
    LocationsVM.prototype.loadData = function() {
        var self = this;
        $.getJSON("data/data.json", function(data) {
            data.forEach(function(location, i) {
                location.id = i;
                self.locations.push( new Location(location) );
            });
        })
    }
    LocationsVM.prototype.clickLocation = function(location) {
        console.log(location.id + " " + location.title);
    }
    LocationsVM.prototype.filterMarkers = function() {
        var filtered_markers = this.filteredLocations().map(function(location) {
            return location.marker;
        });
        this.locations().forEach(function(location) {
            var marker = location.marker;
            if (filtered_markers.includes(marker)) {
                addToMap(marker);
            } else {
                marker.setMap(null);
            }
        });
        return true;
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
    ko.applyBindings(vm);
}

// Adds marker to map if it isn't aleady there.
function addToMap(marker) {
    if (marker.map == null) { // Matches null or undefined
        marker.setMap(map);
    }
}