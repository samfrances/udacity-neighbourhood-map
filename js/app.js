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
        this.wiki_id = data.wiki_id;
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
    LocationsVM.prototype.loadLocations = function(cb, thisArg) {
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
    LocationsVM.prototype.loadLocationsInfo = function() {
        var self = this;

        var pageids = this.locations().map(function(location) {
            return location.wiki_id;
        }).join("|");

        // Build wiki_url
        var wiki_endpoint = "https://en.wikipedia.org/w/api.php";

        // Credit (with modifications): README.md, Third-pary code: [8]
        var wiki_queries = $.param({

            action: "query",
            pageids: pageids,
            prop: "extracts", // I want extracts
            exintro: "",     // Just get the intro
            explaintext: "", // Plain text
            exlimit: "max",  // Return as many of the extracts as possible (not just one)
            format: "json",
        });
        // End credit

        var wiki_url = wiki_endpoint + "?" + wiki_queries;

        $.ajax({
            url: wiki_url,
            data: {
                action: "query",
                pageids: pageids,
                prop: "extracts",
                exintro: "",
                format: "json",
            },
            dataType: "jsonp",
            success: function(data) {
                self.locations().forEach(function(location) {
                    location.wiki_info = data.query.pages[ location.wiki_id ].extract;
                })
            },
        })
    }
    LocationsVM.prototype.clickLocation = function(location, viewmodel) { // viewmodel argument necessary because knockout makes "this" the location object
        console.log(location.id + " " + location.title);
        if (this.mapview) {
            this.mapview.showInfowindow(location.id);
        }
    }
    return LocationsVM;

})();


var MapView = (function() {

    function MapView(viewmodel) {
        // Mutually register viewmodel and mapview
        this.viewmodel = viewmodel;
        this.viewmodel.mapview = this;
    }

    MapView.prototype.initMap = function() {
        var self = this;

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 41.390205, lng: 2.154007},
            zoom: 14,
            mapTypeControl: false, // Remove controls from top left corner of map
        });

        this.bounds = new google.maps.LatLngBounds(); // Export bounds to global scope

        // Add infowindow and set close behaviour
        this.infoWindow = new google.maps.InfoWindow();
        this.infoWindow.addListener('closeclick', function() {
            self.infoWindow.marker = null;
            self.infoWindow.close();
        });
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
            newMarker.addListener('click', bounce);
            newMarker.addListener('click', function() {
                self.showInfowindow(data.id);
            })
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

    MapView.prototype.showInfowindow = function(location_id) {
        var marker = this.markers[location_id];
        // Credit (with modifications): README.md, Third-party code [7]
        if (this.infoWindow.marker != marker) {
            this.infoWindow.marker = marker;

            var data = this.viewmodel.locations()[marker.id];

            var content = '<div class="infowindow">';
            content += "<h3>" + data.title + '</h3>';
            if (data.wiki_info) {
                content += "<p>" + data.wiki_info + "</p>";
            }
            content += "</div>";

            this.infoWindow.setContent(content);
            this.infoWindow.open(this.map, marker);
        }
        // End credit
    }

    MapView.prototype.addToMap = function(marker) {
        if (marker.map == null) { // Matches null or undefined
            marker.setMap(this.map);
            this.bounds.extend(marker.position); // Change map bounds
            this.map.fitBounds(this.bounds);
        }
    }


    // Helper: Makes marker bounce for 3.5 seconds. Expects the parameter "this" to be the marker
    function bounce() {
        var self = this;
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.setAnimation(null);
        }, 3500)
    }

    return MapView;
})();

// Kick off app
var viewmodel = new LocationsVM();
ko.applyBindings(viewmodel);
var mapview = new MapView(viewmodel);

function initMap() {
    mapview.initMap();
    viewmodel.loadLocations(function(data){
        mapview.initMarkers(data);
        viewmodel.loadLocationsInfo()
    });
}