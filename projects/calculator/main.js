var dis1Id = document.getElementById("display-main");
var dis2Id = document.getElementById("display-2nd");

var displayMain = ["0"];
var display2nd = [];
var displayOperant = "";
var lastValue;

window.tooMuch = () => {
    var dis2len = display2nd.join(' ');
    if (displayMain.length > 11 || dis2len.length > 27) {
        dis1Id.innerHTML = "Too many digits";
        dis2Id.innerHTML = "";
        displayMain = ["0"];
        display2nd = [];
        displayOperant = "";
    }
}

window.reset = (type) => {
    if (type === "AC") {
        display2nd = [];
        dis2Id.innerHTML = display2nd;
    }
    displayMain = ["0"];
    dis1Id.innerHTML = "0";
    lastValue = undefined;
}

window.btnNum = (n) => {
    if (displayMain.length <= 11) {
        if (displayOperant !== "") {
            display2nd.push(displayOperant);
            displayOperant = "";
            dis2Id.innerHTML = display2nd.join(" ");
        }
        if (n === "." && displayMain.indexOf(".") !== -1) { return; }
        if (n === "0" && displayMain[0] === "0") { return; }
        if (n !== "." && displayMain[0] == "0") { displayMain[0] = ""; }
        displayMain.push(n);
        dis1Id.innerHTML = displayMain.join("");
    } tooMuch();
}

window.operant = (a) => {
    dis1Id.innerHTML = a;
    if (parseFloat(displayMain.join("")) > 0) {
        displayOperant = a;
        display2nd.push(displayMain.join(""));
        dis2Id.innerHTML = display2nd.join(" ");
        displayMain = ["0"];
        tooMuch();
    } else if (typeof lastValue === "number") {
        displayMain = [lastValue];
        lastValue = undefined;
        operant(a);
    }
}

window.equals = () => {
    if (parseFloat(displayMain.join("")) > 0) {
        display2nd.push(displayMain.join(""));
    }
    dis2Id.innerHTML = display2nd.join(" ");
    tooMuch();
    var z = display2nd.join("");
    z = z.replace(/÷/g, '/').replace(/×/g, '*');
    if (z === '') z = '0';
    z = parseFloat(eval(z).toFixed(9));
    z = z.toString().split('');
    while (z.length > 11 && z.indexOf(".") !== -1) {
        z.pop();
    }
    z = z.join('');
    tooMuch();
    dis1Id.innerHTML = z;
    lastValue = parseFloat(z);
    displayMain = ['0'];
    display2nd = [];
    displayOperant = "";
}