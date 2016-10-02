/* File for Javascript purely related to the UI and view */
$(function() {
    // Set event listener for showing or hiding the sliding menu
    $(".menu-btn").click(function() {
        $(document.body).toggleClass("menu-hidden");
    });

    // Event listener to close sliding menu when esc key is pressed
    // Credit (with modifications): README.md, Third-party code [6]
    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            $(document.body).toggleClass("menu-hidden", true);
        }
    });

    // Set event handler on search listing, so if a link is clicked
    // and the screen size is mobile, the menu hides after a link is clicked
    $('.search-listing-list').click(function(event) {
        if ( $(event.target).is("a") ) {
            if (window.matchMedia("(max-width: 500px)").matches) {
                $(document.body).toggleClass("menu-hidden", true);
            }
        }
    });
});