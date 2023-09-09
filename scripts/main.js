const uselessButton = document.querySelector(".uselessButton");
const anotherUselessButton = document.querySelector(".anotherUselessButton");

uselessButton.addEventListener("click", () => {
    uselessButton.style.backgroundColor = getRandomRGB();
})

anotherUselessButton.addEventListener("click", () => {
    document.querySelector("html").style.backgroundColor = getRandomRGB();
})

function getRandomRGB() {
    // From here: https://stackoverflow.com/a/23095731/19011543.
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}
