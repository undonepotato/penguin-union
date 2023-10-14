/*

Supplemental to base.css, this handles
more complicated/conditional aspects of the CSS that fits
the content and navigation to the screen.

*/

const hamburgerButton = document.querySelector("#hamburger-menu");
const sideNavElements = document.querySelectorAll(".side-nav, #darken-not-sidebar");
const sideNavExit = document.querySelector("#side-nav-back");
const contentDarken = document.querySelector("#darken-not-sidebar");
const rootElement = document.documentElement;

hamburgerButton.addEventListener("click", toggleSidebar);

for (element of sideNavElements) {
    element,addEventListener("animationend", sidebarClosed);
}

sideNavExit.addEventListener("click", toggleSidebar)

contentDarken.addEventListener("click", toggleSidebar);
contentDarken.addEventListener("animationend", sidebarClosed);

function toggleSidebar () {
    for (element of sideNavElements) {
        if (element.classList.contains("activated")) {
            element.classList.add("closing");
        }
        else {
            element.classList.add("activated");
        }
    }
    if (rootElement.style.overflow == "hidden") {
        rootElement.style.overflow = "visible";
    }
    else {
        rootElement.style.overflow = "hidden";
    }
}

function sidebarClosed () {
    for (element of sideNavElements) {
        if (element.classList.contains("closing")) {
            element.classList.remove("activated");
            element.classList.remove("closing");
        }
    }
}

