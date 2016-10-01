var map;
function initMap() {
// Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.390205, lng: 2.154007},
        zoom: 13,
    });
}