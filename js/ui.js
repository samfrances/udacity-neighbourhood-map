/* File for Javascript purely related to the UI and view */
window.addEventListener('load', function() {
    // Set event listener for showing or hiding the sliding menu
    document.getElementsByClassName("menu-btn")[0].addEventListener("click", function() {
        document.body.classList.toggle("menu-hidden");
    });
});