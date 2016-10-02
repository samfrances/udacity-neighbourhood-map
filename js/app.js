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
    }
    LocationsVM.prototype.loadData = function(cb, thisArg) {
        var self = this;
        $.getJSON("data/data.json", function(data) {
            data.forEach(function(location, i) {
                location.id = i;
                self.locations.push( new Location(location) );
            });
            // callback called with data once data retrieved and processed
            cb(data);
        })
    }
    LocationsVM.prototype.clickLocation = function(location) {
        console.log(location.id + " " + location.title);
    }
    return LocationsVM;

})();

var MapView = (function() {

    function MapView(viewmodel) {
        this.viewmodel = viewmodel;
    }

    MapView.prototype.initMap = function() {
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 41.390205, lng: 2.154007},
            zoom: 14,
            mapTypeControl: false, // Remove controls from top left corner of map
        });

        this.bounds = new google.maps.LatLngBounds(); // Export bounds to global scope
    }

    MapView.prototype.initMarkers = function(locationsData) {
        var self = this;
        this.markers = {};
        locationsData.forEach(function(data) {
            var newMarker = new google.maps.Marker({
                position: data.location,
                title: data.title,
                animation: google.maps.Animation.DROP,
                id: data.id,
            });
            newMarker.addListener('click', markerUtils.bounce);
            self.markers[data.id] = newMarker;
        });

        // Function to filter markers when filteredLocations updates
        function filterMarkers(filteredLocs) {
            var filtered_markers = filteredLocs.map(function(location) {
                return self.markers[location.id];
            });
            self.viewmodel.locations().forEach(function(location) {
                var marker = self.markers[location.id];
                if (filtered_markers.includes(marker)) {
                    self.addToMap(marker);
                } else {
                    marker.setMap(null);
                }
            });
        }

        // Place markers initially
        filterMarkers(this.viewmodel.locations());

        // Watch for changes to filtered list
        this.viewmodel.filteredLocations.subscribe(filterMarkers);

    }

    MapView.prototype.addToMap = function(marker) {
        if (marker.map == null) { // Matches null or undefined
            marker.setMap(this.map);
            this.bounds.extend(marker.position); // Change map bounds
            this.map.fitBounds(this.bounds);
        }
    }

    return MapView;
})();

// Kick off app
var viewmodel = new LocationsVM();
ko.applyBindings(viewmodel);
var mapview = new MapView(viewmodel);

function initMap() {
    mapview.initMap();
    viewmodel.loadData(function(data){
        mapview.initMarkers(data);
    });
}

// Assorted functions for manipulating google maps markers
var markerUtils = {
    // Makes marker bounce for 3.5 seconds. Expects the parameter "this" to be the marker
    bounce: function() {
        var self = this;
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.setAnimation(null);
        }, 3500)
    },
};
