/* File for Javascript purely related to the UI and view */
$(function() {

    // Event handler which shows/hides the menu and focuses/blurs the search bar
    function toggleMenu() {
        $(document.body).toggleClass("menu-hidden");
        if ( $(document.body).hasClass("menu-hidden") ) {
            $('.searchbox').blur();
        } else {
            $('.searchbox').focus();
        }
    }

    // Set event listener for showing or hiding the sliding menu
    $(".menu-btn").click(toggleMenu);

    // Event listener to close sliding menu when esc key is pressed
    // Credit (with modifications): README.md, Third-party code [6]
    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            toggleMenu();
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