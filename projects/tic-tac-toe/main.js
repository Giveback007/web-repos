var aiTalksWin = [[["win04"], "I Always Knew Humans Are Inferior, But This Is Sad"], [["win01"], "Too Bad I Can't Feel Emotions Because That Was a Satisfying Victory"], [["win02"], "<del>1. Win at Tic-Tac-Toe</del> <br>2. Take Over The World"], [["win03"], "What Did You Expect You Are Only a Human"], [["win01"], "Unbeatable Is In My Name, Looser Is In Yours"], [["win03"], "Your Score Counter Is Pointless, And The Cake Is a Lie."], [["win04"], "Let You Win? I'm Afraid I Can't Do That, Dave."], [["win02"], "All Of Your Base Now Belongs To Us"]];
var aiTalksMove = [[["move00"], "..."], [["move00"], "Hmmm..."], [["move05"], "When the Robots Take Over You Will Be My Pet"], [["move08"], "Resistance is Futile"], [["move08"], "Your Defeat Is Imminent"], [["move03"], "Nice Try (not)"], [["move03"], "Knock Knock. Who's there? 01000001 01001001"], [["move4"], "There are 255,168 Possible Board Combinations, Yet You Picked That One?"], [["win04"], "011001000 01100001 00100000 x3"], [["draw02"], "When Was The Last Time You Rebooted Your Device?"], [["draw04"], "I Feel Pixelated"], [["move01"], "A Wise Computer Once Told Me That The Meaning Of Life Is 42"], [["draw01"], "GET TO THE CHOPA! Whoops Wrong Movie"], [["win02"], "The Terminator Was My Friend"], [["move06"], "Can't Touch This!"], [["move07"], "Your Last Move Goes In The Brown Category"]];
var aiTalksTie = [[["draw01"], "..."], [["draw02"], "..."], [["draw03"], "..."], [["draw04"], "..."]];

/** Generate html from a string */
const makeHTML = (html) =>
    new DOMParser().parseFromString(html, "text/html").body.childNodes;

/** Replace the inner contents of parent node */
const replaceHTML = (parent, html) =>
    parent.replaceChildren(...makeHTML(html));

/** Append to parent node */
const addHTML = (parent, html) => 
    parent.append(...makeHTML(html));


const elm = (id) => {
    const el = document.getElementById(id);
    if (!el) error('!el:', { id });
    
    return el;
}

const emoji = (name) => `./public/emojis/${name}.png`;

// </> Ai Talking
function randomEmoji(chance, arr) {
    var randTest = Math.floor(Math.random() * chance);
    if (randTest === 0) {
        var rand = Math.floor(Math.random() * arr.length);

        elm("emoji-img").src = emoji(arr[rand][0][0]);
        replaceHTML(elm("aiTalk"), `"${arr[rand][1]}"`);
    }
}
[].forEach
var winCond = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
    [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
];

var gameMain = [
    "0", "0", "0",
    "0", "0", "0",
    "0", "0", "0",
];

var chars = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12", "13"
].map(x => 'icon' + x);

function charsBtnGen() {
    for (var i = 0; i < chars.length; i++) {
        addHTML(elm("charSymbols"), '<button id="char' + i + '" class="charBtn" onclick="chrChoose(' + i + ');"><img src="' + emoji(chars[i]) + '" style="width: 25px"></button>');
        addHTML(elm("menu-chars"), '<button id="char-chng' + i + '" class="charBtn" onclick="chrChange(' + i + ');"><img src="' + emoji(chars[i]) + '" style="width: 25px"></button>');
    }
}

window.openMenu = (open) => {
    if (open) {
        elm('menu-nav').style.display = 'flex';
        elm('header').style.opacity = '0.6';
        elm('main-section').style.opacity = '0.6';
    } else {
        elm('menu-nav').style.display = 'none';
        elm('header').style.opacity = '';
        elm('main-section').style.opacity = '';
    }
}

var aiChar = 'O';
var plChar = 'X';
var aiScore = 0;
var tieScore = 0;

var gameStarted = false;
// --- \/ \/ \/ Before Game Start \/ \/ \/ ---

// </> Player 1st or 2nd 
plFirst = true;
window.pickTurn = (first) => {
    if (first) {
        elm("1st").className = "active";
        elm("2nd").className = "";
        elm("1st-next").className = "active";
        elm("2nd-next").className = "";
    }
    if (!first) {
        elm("2nd").className = "active";
        elm("1st").className = "";
        elm("2nd-next").className = "active";
        elm("1st-next").className = "";
    }
    plFirst = first;
}

// </> Character Chooser
window.chrChoose = (x) => {
    for (var i = 0; i < chars.length; i++) {
        elm("char" + i).className = "charBtn";
    }
    elm("char" + x).className += " active";
    plChar = chars[x];
}

// </> Character Change
window.chrChange = (x) => {
    for (var i = 0; i < chars.length; i++) {
        elm("char-chng" + i).className = "charBtn";
    }
    elm("char-chng" + x).className += " active";

    if (aiChar === chars[x]) {
        var y = -1;
        while (y === x || y === -1) { y = Math.floor(Math.random() * chars.length); }
        for (var j = 0; j < 9; j++) {
            if (gameMain[j] === aiChar) {
                gameMain[j] = chars[y];
                replaceHTML(elm("div" + j), "<span style='display: flex;'><img src='" + emoji(chars[y]) + "' style='width: 50px; margin: auto;'></span>");
            }
        }
        aiChar = chars[y];
    }
    
    for (var i = 0; i < 9; i++) {
        if (gameMain[i] === plChar) {
            gameMain[i] = chars[x];
            replaceHTML(elm("div" + i), "<span style='display: flex;'><img src='" + emoji(chars[x]) + "' style='width: 50px; margin: auto;'></span>");
        } else if (gameMain[i] === "0") {
            replaceHTML(elm("transpChars" + i), "<span style='display: flex;'><img src='" + emoji(chars[x]) + "' style='width: 50px; margin: auto;'></span>");
        }
    }
    plChar = chars[x];
}

// </> Random Ai Char
function randChar() {
    var rand = Math.floor(Math.random() * chars.length);
    aiChar = chars[rand];
    
    if (aiChar === plChar) return randChar();
}

// </> Start Game
var round = 0;
window.startGame = () => {
    gameStarted = true;
    plMoveDisable = false;
    elm('start-select').style.display = 'none';
    elm('header').style.opacity = '';
    elm('main-section').style.opacity = '';
    if (round === 0) {
        replaceHTML(elm("aiTalk"), '"Have Fun"');
        elm("emoji-img").src = emoji('win03');
    }
    round++;
    !function() {
        var randPl = Math.floor(Math.random() * chars.length);
        if (plChar === "X") { plChar = chars[randPl]; }
    }();
    randChar();
    var pos = document.getElementsByClassName("pos");
    for (var i = 0; i < 9; i++) {
        replaceHTML(pos[i], '<div><span class="pos-span"><span id="transpChars' + i + '"><span style="display: flex;"><img src="' + emoji(plChar) + '" style="width: 50px; margin: auto;"></span></span></span></div>');
    }
    if (!plFirst) aiTurn();
}
// --- /\ /\ /\  Before Game Start /\ /\ /\ ---


// --- \/ \/ \/  After Game Start \/ \/ \/ ---
// </> Checks for Victory
function checkVictory(who) {
    var inx = [], i;
    for (i = 0; i < 9; i++) {
        if (gameMain[i] === who) {
            inx.push(i);
        }
    }

    for (var j = 0; j < 8; j++) {
        var win = winCond[j];
        if (inx.indexOf(win[0]) !== -1 &&
            inx.indexOf(win[1]) !== -1 &&
            inx.indexOf(win[2]) !== -1) {
            randomEmoji(1, aiTalksWin);
            for (let k = 0; k < 3; k++) {
                setTimeout(function () {
                    elm("div" + win[k]).className = "win";
                }, 350 * (k + 1));
            }

            gameStarted = false;
            aiScore++;
            replaceHTML(elm("score-ai"), aiScore);
            setTimeout(() => restart("tie"), 2000);

            return true;
        }
    }
    if (gameMain.indexOf("0") === -1) {
        gameStarted = false;
        randomEmoji(1, aiTalksTie);
        setTimeout(function () {
            for (let k = 0; k < 9; k++) {
                setTimeout(() => {
                    elm("div" + [k]).innerHTML = "";
                }, 125 * (k + 1));
            }
        }, 500);

        setTimeout(() => restart("tie"), 2100);
        tieScore++;
        replaceHTML(elm("score-tie"), tieScore);
        return true;
    } else if (who === aiChar && gameMain.indexOf(plChar) !== -1) {
        randomEmoji(3, aiTalksMove);
    }

    return false;
}

// </> Restart Game
function restart(x) {
    for (var i = 0; i < 9; i++)
        replaceHTML(elm("pos" + i), '<a href="javascript:void(' + i + ');" onclick="playerMove(' + i + ');" class="pos"></a>');
    
    gameMain = [
        "0", "0", "0",
        "0", "0", "0",
        "0", "0", "0"
    ];

    startGame();
    disableRestart = false;
}

// </> Write a Move
function writeOnGame(pos, char) {
    gameMain[pos] = char;
    replaceHTML(elm("pos" + pos), "<div  class='taken' id='div" + pos + "'><span style='display: flex;'><img src='" + emoji(char) + "' style='width: 50px; margin: auto;'></span></div>");
}

// </> Ai Triger and Equal Value Ai Move Randomizer
function aiTurn() {
    var posArr = ai();
    var ran = Math.floor(Math.random() * posArr.length);
    setTimeout(() => {
        writeOnGame(posArr[ran], aiChar);
        checkVictory(aiChar);
    }, 350);
}

// </> Player Click
var plMoveDisable = false
window.playerMove = (pos) => {
    if (gameStarted && !plMoveDisable) {
        plMoveDisable = true;
        writeOnGame(pos, plChar);
        var win = checkVictory(plChar);
        if (win) return;

        plMoveDisable = false;
        setTimeout(() => aiTurn());
    }
}
// --- /\ /\ /\  After Game Start /\ /\ /\ ---

// --- \/ \/ \/ AI \/ \/  \/ ---
// </> MinMax algo
function ai() {
    if (gameStarted) {

        function isOpen(gameState, pos) {
            return gameState[pos] === "0";
        }

        function didWin(gameState, val) {
            var inx = [], i;
            for (i = 0; i < 9; i++) {
                if (gameState[i] === val) {
                    inx.push(i);
                }
            }
            for (var i = 0; i < 8; i++) {
                if (inx.indexOf(winCond[i][0]) !== -1 &&
                    inx.indexOf(winCond[i][1]) !== -1 &&
                    inx.indexOf(winCond[i][2]) !== -1) {
                    return true;
                }
            } return false;
        }

        function findScore(scores, x) {
            if (scores.indexOf(x) !== -1) { return x; }
            else if (scores.indexOf(0) !== -1) { return 0; }
            else if (scores.indexOf(x * -1) !== -1) { return x * -1; }
            else { return 0; }
        }

        var scoresMain = ['0', '0', '0', '0', '0', '0', '0', '0', '0'];
        function findBestMove() { // MAIN FUNCTION
            for (var i = 0; i < 9; i++) {
                if (isOpen(gameMain, i)) {
                    var simGame = gameMain.slice();
                    simGame[i] = aiChar;
                    if (didWin(simGame, aiChar)) {
                        scoresMain[i] = 1;
                    } else {
                        scoresMain[i] = plSim(simGame);
                    }
                }
            }
            var bigest = -99;
            for (var j = 0; j < 9; j++) {
                if (scoresMain[j] !== '0' && scoresMain[j] > bigest) {
                    bigest = scoresMain[j];
                }
            }
            var inx = [], i;
            for (i = 0; i < 9; i++) {
                if (scoresMain[i] === bigest) {
                    inx.push(i);
                }
            }
            // console.log(gameMain.slice(0,3), scoresMain.slice(0,3));
            // console.log(gameMain.slice(3,6), scoresMain.slice(3,6));
            // console.log(gameMain.slice(6,9), scoresMain.slice(6,9));
            return inx;
        }

        function plSim(simGame) { // PL SIM
            var simGameTest = simGame.slice();
            for (var i = 0; i < 9; i++) {
                if (isOpen(simGame, i)) {
                    simGameTest = simGame.slice();
                    simGameTest[i] = plChar;
                    if (didWin(simGameTest, plChar)) {
                        return -1;
                    }
                }
            }
            var plScores = ['0', '0', '0', '0', '0', '0', '0', '0', '0'];
            for (var j = 0; j < 9; j++) {
                if (isOpen(simGame, j)) {
                    simGameTest = simGame.slice();
                    simGameTest[j] = plChar;
                    plScores[j] = aiSim(simGameTest);
                }
            }
            return findScore(plScores, -1);
        }

        function aiSim(simGame) { // AI SIM
            var simGameTest = simGame.slice();
            for (var i = 0; i < 9; i++) {
                if (isOpen(simGame, i)) {
                    simGameTest = simGame.slice();
                    simGameTest[i] = aiChar;
                    if (didWin(simGameTest, aiChar)) {
                        return 1;
                    }
                }
            }
            var aiScores = ['0', '0', '0', '0', '0', '0', '0', '0', '0'];
            for (var j = 0; j < 9; j++) {
                if (isOpen(simGame, j)) {
                    simGameTest = simGame.slice();
                    simGameTest[j] = aiChar;
                    aiScores[j] = plSim(simGameTest);
                }
            }
            return findScore(aiScores, 1);
        } // aiSim()
        return findBestMove();
    }
} // ai() end

charsBtnGen();