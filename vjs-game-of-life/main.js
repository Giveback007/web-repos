var gridHeight = 65;
var gridLength = 65;
var spawnRate = 0.50; // random array spawn rate (50% = 0.5)

const filler = [];
function generateGrid() {
	var randomArr = [];
	for (var i = 0; i < gridHeight; i++) {
		randomArr[i] = [];
		filler[i] = [];
		for (var j = 0; j < gridLength; j++) {
			var random = Math.random() < spawnRate;
			var num = random ? 1 : 0;
			randomArr[i][j] = num;
			filler[i][j] = 0;
		}
	}
	return randomArr;
}

// </main>
function futureState(currentState) {
	var cst = currentState.slice();
	var score = JSON.parse(JSON.stringify(filler));
	var ht = cst.length - 1;
	var lh = cst[0].length - 1;

	function passScore(row, col) {
		var rowTop = row-1, rowBot = row+1, colL = col-1, colR = col+1;

		if (row == 0)
            rowTop = ht
		else if (row == ht)
            rowBot = 0

        score[rowTop][colL] += 1;
        score[rowTop][col] += 1;
        score[rowTop][colR] += 1;
        score[row][colL] += 1;
        score[row][colR] += 1;
        score[rowBot][colL] += 1;
        score[rowBot][col] += 1;
        score[rowBot][colR] += 1;
	}

	function leftColPass(row, col) {
		var rowTop = row-1, rowBot = row+1, colL = lh, colR = col+1;

        score[rowTop][colL] += 1;
        score[rowTop][col] += 1;
        score[rowTop][colR] += 1;
        score[row][colL] += 1;
        score[row][colR] += 1;
        score[rowBot][colL] += 1;
        score[rowBot][col] += 1;
        score[rowBot][colR] += 1;
	}

	function rightColPass(row, col) {
		var rowTop = row-1, rowBot = row+1, colL = col-1, colR = 0;

        score[rowTop][colL] += 1;
        score[rowTop][col] += 1;
        score[rowTop][colR] += 1;
        score[row][colL] += 1;
        score[row][colR] += 1;
        score[rowBot][colL] += 1;
        score[rowBot][col] += 1;
        score[rowBot][colR] += 1;
	}

	score[0][0] = 1; score[0][lh] = 1; score[ht][0] = 1; score[ht][lh] = 1;
	if (cst[0][0])
	{score[ht][0] += 1; score[ht][1] += 1; score[0][lh] += 1; score[0][1] += 1; score[1][lh] += 1; score[1][0] += 1; score[1][1] += 1}
	if (cst[0][lh])
	{score[ht][lh-1] += 1; score[ht][lh] += 1; score[0][lh-1] += 1; score[0][0] += 1; score[1][lh-1] += 1; score[1][lh] += 1; score[1][0] += 1}
	if (cst[ht][0])
	{score[ht-1][lh] += 1; score[ht-1][0] += 1; score[ht-1][1] += 1; score[ht][lh] += 1; score[ht][1] += 1; score[0][0] += 1; score[0][1] += 1}
	if (cst[ht][lh])
	{score[ht-1][lh-1] += 1; score[ht-1][lh] += 1; score[ht-1][0] += 1; score[ht][lh-1] += 1; score[ht][0] += 1; score[0][lh-1] += 1; score[0][lh] += 1}

	for (var i = 0; i <= ht; i++)
		for (var j = 1; j < lh; j++)
			if (cst[i][j]) {passScore(i, j)}

	for (var i = 1; i < ht; i++)
		if (cst[i][0]) leftColPass(i, 0)

	for (var i = 1; i < ht; i++)
		if (cst[i][lh]) rightColPass(i, lh)

	// new code \/
	function newStateFromScore() {
		var newState = [];
		for (var i = 0; i < score.length; i++) {
			newState[i] = [];
			for (var j = 0; j < score[i].length; j++) {
				if (score[i][j] > 3 || score[i][j] < 2) {newState[i][j] = 0}
				else if (score[i][j] == 3) {newState[i][j] = 1}
				else if (score[i][j] == 2 && cst[i][j] == 1) {newState[i][j] = 1}
				else {newState[i][j] = 0}
			}
		}
		return newState;
	}

	return newStateFromScore();
}


function generateDOM(nowState) {
	nowState = JSON.parse(JSON.stringify(nowState));
	document.getElementById('main').innerHTML = '';

    for (var i = 0; i < nowState.length; i++) {
        var div = document.createElement('DIV');
        div.id = 'div-'+i;
        div.className = 'row'
        document.getElementById('main').appendChild(div);
        for (var j = 0; j < nowState[i].length; j++) {
            var divSm = document.createElement('DIV');
            divSm.className = 'off';
            if (nowState[i][j]) {divSm.className = 'on';}
            document.getElementById('div-'+i).appendChild(divSm);
        }
    }
}


var xyz = generateGrid();
generateDOM(xyz);

document.getElementById("load").addEventListener("click", function(){
	xyz = generateGrid();
	generateDOM(xyz);
});

var interv = setInterval(() => {
    xyz = futureState(xyz);
    generateDOM(xyz);
}, 35);
