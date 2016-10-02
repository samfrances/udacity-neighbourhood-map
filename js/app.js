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
        this.marker.addListener('click', markerUtils.bounce);
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

        // Filter markers when filteredLocations updates
        this.filteredLocations.subscribe(function(newValue) {
            var self = this;
            var filtered_markers = newValue.map(function(location) {
                return location.marker;
            });
            this.locations().forEach(function(location) {
                var marker = location.marker;
                if (filtered_markers.includes(marker)) {
                    markerUtils.addToMap(marker);
                } else {
                    marker.setMap(null);
                }
            });
        }, this);

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
    return LocationsVM;

})();


var vm; // TODO: move declaraton into initMap once no longer needed for debugging
var map;
var bounds;
function initMap() {
// Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.390205, lng: 2.154007},
        zoom: 14,
        mapTypeControl: false, // Remove controls from top left corner of map
    });

    bounds = new google.maps.LatLngBounds(); // Export bounds to global scope

    // KO Experimentation REMOVE_COMMENT
    vm = new LocationsVM();
    ko.applyBindings(vm);
}

// Assorted functions for manipulating google maps markers
var markerUtils = {

    // Adds marker to map if it is not already there
    addToMap: function(marker) {
        if (marker.map == null) { // Matches null or undefined
            marker.setMap(map);
            bounds.extend(marker.position); // Change map bounds
            map.fitBounds(bounds);
        }
    },

    // Makes marker bounce for 3.5 seconds. Expects the parameter "this" to be the marker
    bounce: function() {
        var self = this;
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.setAnimation(null);
        }, 3500)
    },
};
