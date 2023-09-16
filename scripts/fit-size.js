/*

Supplemental to fit-size.css and base.css, this handles
more complicated/conditional aspects of the CSS that fits
the content and navigation to the screen.

*/

const hamburgerButton = document.querySelector("#hamburger-menu");
const sideNavElements = document.querySelectorAll(".side-nav, #darken-not-sidebar");
const contentDarken = document.querySelector("#darken-not-sidebar");
const rootElement = document.documentElement;

hamburgerButton.addEventListener("click", toggleSidebar);

contentDarken.addEventListener("click", toggleSidebar);

function toggleSidebar () {
    for (element of sideNavElements) {
        element.classList.toggle("activated");
    }
    if (rootElement.style.overflow == "hidden") {
        rootElement.style.overflow = "visible";
    }
    else {
        rootElement.style.overflow = "hidden";
    }
}
