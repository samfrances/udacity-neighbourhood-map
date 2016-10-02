/**
 * Model 'class' representing locations
 */
var Location = (function() {

    /**
     * @constructor
     * @param {Object} - Object literal with data relating to the location.
     *      {
     *           title: {string},
     *           search: {sring},   // Searchable version of title, no accents
     *           id: {Number},
     *           location: {
     *              lat: {Number},
     *              lng: {Number}
     *           }
     *           wiki_id: {Number}  // Wikipedia API article ID
     *      }
     *
     */
    function Location(data) {
        this.title = data.title;
        this.search = data.search; // non-accented title string for search purposes
        this.id = data.id;
        this.location = data.location;
        this.wiki = {
            id: data.wiki_id,
        };
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

        this.locations = ko.observableArray();
        this.ajaxError = ko.observable(false);  // Changes to contain error message if ajax error takes place

        // Search filter, bound to search bar in view
        this.filter = ko.observable("");

        // Credit (with modifications): See README, Third-party code [5]
        // Provides a filtered version of locations, filtered according to the search term
        this.filteredLocations = ko.computed(function() {
            // trim the search term and put in lowercase
            var filter = $.trim( self.filter().toLowerCase() );
            if (!filter) {
                return self.locations();
            } else {
                return ko.utils.arrayFilter(self.locations(), function(location) {
                    // A location is included if its title or search field matches the
                    // search term (after transforming to lowercase).
                    return (location.title.toLowerCase().indexOf(filter) !== -1 ||
                            location.search.toLowerCase().indexOf(filter) !== -1);
                });
            }
        });
        // End credit
    }

    /**
     * Loads locatons data from server using Ajax.
     * @param {function} cb - An optional callback to be called once data is loaded,
     *      which gets passed that data with an id added.
     */
    LocationsVM.prototype.loadLocations = function(cb) {
        var self = this;

        $.getJSON("data/data.json", function(data) {
            // Populate objects in viewmodel.locations observableArray with
            // retrieved data.
            data.forEach(function(location, i) {
                location.id = i;
                self.locations.push( new Location(location) );
            });

            // Load corresponding wikipedia data
            self._loadLocationsInfo();
            // callback called with data once data retrieved and processed
            if (cb) {
                cb(data);
            }
        }).fail(function() {
            self.ajaxError("Error fetching locations");
        });
    };

    /*
     * 'Private' method, loads an informative passage from wikipedia for
     * each location. Called in success for ajax call which loads the basic
     * location data in viewmodel.loadLocations.
     */
    LocationsVM.prototype._loadLocationsInfo = function() {
        var self = this;

        // Build wiki_url
        var wiki_endpoint = "https://en.wikipedia.org/w/api.php";

        var pageids = this.locations().map(function(location) {
            return location.wiki.id;
        }).join("|");

        // Credit (with modifications): README.md, Third-pary code: [8]
        var wiki_queries = $.param({

            action: "query",
            pageids: pageids,
            prop: "extracts",   // Get extracts
            exintro: "",        // Just get the intro
            explaintext: "",    // Plain text
            exlimit: "max",     // Return as many of the extracts as possible (not just one)
            format: "json",
        });
        // End credit

        var wiki_url = wiki_endpoint + "?" + wiki_queries;

        $.ajax({
            url: wiki_url,
            dataType: "jsonp",
        }).done(function(data) {
            // If data retrieved, at it to our location objects
            self.locations().forEach(function(location) {
                location.wiki.info = data.query.pages[ location.wiki.id ].extract;
            });
        }).fail(function() {
            // If ajax call fails, add error messages to each location object
            // and set an error on viewmodel.ajaxError.
            self.locations().forEach(function(location) {
                var error = "Error loading Wikipedia data.";
                location.wiki.error = error;
                self.ajaxError(error);
            });
        });
    };

    /*
     * Handler for clicks on location links in sidebar. Receives Location object.
     */
    LocationsVM.prototype.clickLocation = function(location) { // viewmodel argument necessary because knockout makes "this" the location object
        if (this.mapview) {
            this.mapview.activateMarker(location.id);
        }
    };

    return LocationsVM;

})();

/**
 * View 'class' for dealing with Map functionality
 */
var MapView = (function() {

    /* @constructor */
    function MapView(viewmodel) {
        // Mutually register viewmodel and mapview
        this.viewmodel = viewmodel;
        this.viewmodel.mapview = this;
    }

    /* Method to initialise the map */
    MapView.prototype.initMap = function() {
        var self = this;

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 41.390205, lng: 2.154007},
            zoom: 14,
            mapTypeControl: false, // Remove controls from top left corner of map
        });

        // Create bounds object, to be adjusted by markers
        this.bounds = new google.maps.LatLngBounds();

        // Add infowindow and set close behaviour
        this.infoWindow = new google.maps.InfoWindow();
        this.infoWindow.addListener('closeclick', function() {
            self._closeInfoWindow();
        });
    };

    /* Method to crate and store the markers */
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

            // Add click handler to marker
            newMarker.addListener('click', function() {
                self.activateMarker(data.id);
            });
            // Store marker according to id of its location
            self.markers[data.id] = newMarker;
        });

        // Callback function to filter markers when filteredLocations updates
        function filterMarkers(filteredLocs) {
            // Get all the markers that pass the search filter
            var filtered_markers = filteredLocs.map(function(location) {
                return self.markers[location.id];
            });
            // For each of these markers, add the to the map if not already
            // there, and remove all others.
            self.viewmodel.locations().forEach(function(location) {
                var marker = self.markers[location.id];
                if (filtered_markers.includes(marker)) {
                    // Add marker if it passes search filter
                    self._addToMap(marker); // _addToMap adds marker to map if not already there
                } else {

                    // Close the infowindow if attached to filtered-out marker
                    if (self.infoWindow.marker == marker) {
                        self._closeInfoWindow();
                    }

                    // Remove the marker
                    marker.setMap(null);
                }
            });
        }

        // Place markers initially
        filterMarkers(this.viewmodel.locations());

        // Watch for changes to filtered list
        this.viewmodel.filteredLocations.subscribe(filterMarkers);
    };

    /* 'Private' method for populating and displaying info window */
    MapView.prototype._showInfowindow = function(location_id) {
        var marker = this.markers[location_id];
        // Credit (with modifications): README.md, Third-party code [7]
        if (this.infoWindow.marker != marker) {
            this.infoWindow.marker = marker;

            // Get data for infowindow (relevant Location object)
            var data = this.viewmodel.locations()[marker.id];

            // Write content for infowindow
            var content = '<div class="infowindow">';
            content += "<h3>" + data.title + '</h3>';
            // Display error if there is one
            if (data.wiki.error) {
                content += "<p>" + data.wiki.error + "</p>";
            // Otherwise display wikipedia info
            } else if (data.wiki.info) {
                content += "<p>" + data.wiki.info + "</p>";
                content += '<p>Attribution: ';
                content += '<a href="http://en.wikipedia.org/wiki?curid=';
                content += data.wiki.id;
                content += '" target="_new">Wikipedia</a></p>';
            }
            content += "</div>";

            // Populate and place infowindow
            this.infoWindow.setContent(content);
            this.infoWindow.open(this.map, marker);
        }
        // End credit
    };

    /* 'Private' method for closing infowindow */
    MapView.prototype._closeInfoWindow = function() {
        this.infoWindow.close();
        this.infoWindow.marker = null;
    };

    /* Public method for animating marker and showing infowindow simultaneously */
    MapView.prototype.activateMarker = function(location_id) {
        var marker = this.markers[location_id];
        bounce(marker);
        this._showInfowindow(location_id);
    };

    /* Helper method, adds marker to map only if not already there */
    MapView.prototype._addToMap = function(marker) {
        if (marker.map == null) { // Matches null or undefined
            marker.setMap(this.map);
            this.bounds.extend(marker.position); // Change map bounds
            this.map.fitBounds(this.bounds);
        }
    };


    // Helper: Makes marker bounce for 3.5 seconds. Expects the parameter "this" to be the marker
    function bounce(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 3500);
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
    });
}