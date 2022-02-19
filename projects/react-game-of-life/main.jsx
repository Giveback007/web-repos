import React from 'react';
import ReactDOM from 'react-dom';
import './style.sass';

const genSvg = (path, viewBox) =>
	<svg
		stroke="currentColor"
		fill="currentColor"
		strokeWidth="0"
		viewBox={viewBox}
		height="1.5em"
		width="1.5em"
		xmlns="http://www.w3.org/2000/svg"
	>{path}</svg>

const svgs = {
	play: genSvg(<path d="M96 448l320-192L96 64v384z"></path>, "0 0 512 512"),
	pause: genSvg(<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>, "0 0 16 16"),
	random: genSvg(<path d="M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"></path>, "0 0 512 512"),
	stop: genSvg(<path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z"></path>, "0 0 448 512"),
}

// prep code //
var styleSheet;
(function(){
	var styleEl = document.createElement('style');
	document.head.appendChild(styleEl);
	styleSheet = styleEl.sheet;
})()

var navIsOn = false;
function toggleNav() {
	var btn = document.getElementById('navOnOff');
	var nav = document.getElementById('nav');
	navIsOn = !navIsOn;
	if (navIsOn) {
		btn.classList.add('navOn'); nav.classList.add('navOn');
		styleSheet.deleteRule(0);
		styleSheet.insertRule(`.row div {width: ${Math.floor(initParams.cellSize*0.88)}px; height: ${Math.floor(initParams.cellSize*0.88)}px;}`, 0);
	}
	if (!navIsOn) {
		btn.classList.remove('navOn'); nav.classList.remove('navOn');
		styleSheet.deleteRule(0);
		styleSheet.insertRule(`.row div {width: ${initParams.cellSize}px; height: ${initParams.cellSize}px;}`, 0);
	}
}

function detectMob() {
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 || navigator.userAgent.toLowerCase().indexOf('firefox') > -1
 ){ return true; } else { return false; }
}

function clone(x) {
	return Object.assign({}, x);
}

var initParams = {
	cellSize: 16,
	height: Math.ceil(window.screen.availHeight / 16 + 1), // +1 for codepen header
	length: Math.ceil(window.screen.availWidth / 16),
	randomBirth: true,
	isPoused: false,
	cellBorders: true,
	seasons: true,
	spawnRate: 0.20,
	delay: 50
};

function prepGrid() {
	var cellNum = 4000;
	if (detectMob()) {cellNum = 1500}
	while(initParams.height * initParams.length > cellNum) {
		initParams.cellSize += 1;
		initParams.height = Math.ceil(window.screen.availHeight / (initParams.cellSize+1)); // +1 for codepen header
		initParams.length = Math.ceil(window.screen.availWidth / (initParams.cellSize));
	}
	styleSheet.insertRule(`.row div {width: ${initParams.cellSize}px; height: ${initParams.cellSize}px;}`, 0);
};
prepGrid();

function randomizeGrid(ht, lh, spwnRt) {
	var randGrid = [];
	for (var i = 0; i < ht; i++) {
		randGrid[i] = [];
		for (var j = 0; j < lh; j++) {
			var random = Math.random() < spwnRt;
			var num = random ? 1 : 0;
			randGrid[i][j] = num;
		}
	}
	return randGrid;
}
// prep code //


// react //
// </cell>
function Cell(props) {
	var color = {};
	var className = 'off';
		if (props.cellState > 0) {
			className = 'on';
			color = {background:'hsl('+((172+props.cycle*1.3)+(props.cellState*4.2))+', 58%, 55%)'};
		}
		else if (props.cellState < 0) {
			color = {
				background: 'hsl(162, 66%, '+(66+props.cellState*0.55)+'%)', //////////////////////////////
				borderRadius: '25%'
			}
		}
		return(
			<div
				className={className}
				style={color}
				onClick={() => props.onClick(props.row, props.col)}
			/>);
	}

// </row>
function Row(props) {
		var preRenderRow = props.rowState.map((x, i) =>
			<Cell
				key={i}
				col={i}
				cycle={props.cycle}
				row={props.row}
				cellState={x}
				onClick={props.onClick}
			/>
		);
		return <div className='row'>{preRenderRow}</div>;
}

// </grid>
class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			params: initParams,
			gridState: randomizeGrid(initParams.height, initParams.length, initParams.spawnRate),
			cycles: 0,
		}
		this.clickCell = this.clickCell.bind(this)
		this.paramsUpdate = this.paramsUpdate.bind(this);
		this.nextCycle = this.nextCycle.bind(this);
		this.clearGrid = this.clearGrid.bind(this);
		this.randomize = this.randomize.bind(this);
		this.genNextGridState = this.genNextGridState.bind(this);
	}

	// </main func>
	genNextGridState(cst) {
		var fts = [];
		var score = [];
		for(var i = 0; i < cst.length; i++) {
			fts[i] = cst[i].slice();
			score[i] = [];
		for(var j = 0; j < cst[i].length; j++) {
	    score[i][j] = 0; }}

			var ht = cst.length - 1;
			var lh = cst[0].length - 1;

		function passScore(row, col) {
			var rowTop = row-1, rowBot = row+1, colL = col-1, colR = col+1;
			if (row == 0) {rowTop = ht}
			else if (row == ht) {rowBot = 0}
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

		for (var i = 0; i <= ht; i++) {
			for (var j = 1; j < lh; j++) {
				if (cst[i][j] > 0) {passScore(i, j)}
			}}

		for (var i = 1; i < ht; i++) {
			if (cst[i][0] > 0) {leftColPass(i, 0)}
		}

		for (var i = 1; i < ht; i++) {
			if (cst[i][lh] > 0) {rightColPass(i, lh)}
		}

			for (var i = 0; i < score.length; i++) {
				for (var j = 0; j < score[i].length; j++) {
					if (cst[i][j] == 0 && score[i][j] == 0) {}//{fts[i][j] = 0} // stay empty
					else if (cst[i][j] >= 1 && (score[i][j] > 3 || score[i][j] < 2)) {fts[i][j] = -25} // die
					else if (cst[i][j] <= 0 && score[i][j] == 3) {fts[i][j] = 1} // born
					else if (cst[i][j] >= 1 && (score[i][j] == 2 || score[i][j] == 3)) {fts[i][j] += 1} // stay alive
					else if (cst[i][j] < 0) {fts[i][j] += 1} // was dead ------ must stay last
				}
			}

			if (this.state.params.randomBirth && this.state.cycles % 10 == 0) {
				var h = Math.floor(Math.random() * ht);
				var l = Math.floor(Math.random() * lh);
				if (!fts[h][l]){fts[h][l] = 1}
			}
		return fts;
	}

	clickCell(r, c) {
		var tempGrid = [];
		this.state.gridState.map( (x) => tempGrid.push(x) );
		if(!tempGrid[r][c]) {tempGrid[r][c] = 1}
		else {tempGrid[r][c] = 0}
		this.setState({gridState: tempGrid});
	}

	clearGrid() {
		var tempParams = clone(this.state.params);
		tempParams.isPoused = true;
		var tempGrid = []
		for (var i = 0; i < tempParams.height; i++) {
			tempGrid[i] = [];
			for (var j = 0; j < tempParams.length; j++) {
				tempGrid[i][j] = [0];			}		}
		this.setState({gridState: tempGrid, params: tempParams, cycles: 0});
	}

	randomize() {
		var pars = this.state.params;
		this.setState({
			gridState: randomizeGrid(
				pars.height,
				pars.length,
				pars.spawnRate
			),
			cycles: 0
		})
	}

	paramsUpdate(p) {
		this.setState({params: p})
	}

	nextCycle() {
		if (!this.state.params.isPoused) {
			this.setState({
				gridState: this.genNextGridState(this.state.gridState),
				cycles: this.state.cycles + 1
			});
		}
		setTimeout(this.nextCycle, this.state.params.delay)
	}

	componentDidMount() {
		this.nextCycle();
	}

	render() {
		var preRenderGrid = this.state.gridState.map(
			(x, i) =>
				<Row
					key={i}
					row={i}
					rowState={x}
					cycle={this.state.params.seasons ? this.state.cycles : 0}
					onClick={this.clickCell}
				/>
		);
		return(
			<section>
				<div id='cycles'>
					<h3>Generations</h3>
					<h3>{this.state.cycles}</h3>
				</div>
				<Menu
					update={this.paramsUpdate}
					clearGrid={this.clearGrid}
					params={this.state.params}
					randomize={this.randomize}
				/>
				<section id='grid-container'>
					<div id='grid'>{preRenderGrid}</div>
				</section>
			</section>
		);
	}
}

// </menu>
function Menu (props){

	function spawnRate(isMore) {
		var temp = clone(props.params);
		if ((temp.spawnRate > 0 || isMore) && (temp.spawnRate < 1 || !isMore)) {
			isMore ? temp.spawnRate += 0.05 : temp.spawnRate -= 0.05
			if (temp.spawnRate < 0) {temp.spawnRate = 0};
			initParams.spawnRate = temp.spawnRate; // temporary
		}
		props.update(temp);
	}

	function changeSpeed(isFaster) {
		var temp = clone(props.params);
		if (temp.delay > 0 || !isFaster)	{
			var change = temp.delay >= 200 ? 200 : 50;
			if (temp.delay === 200 && isFaster) {change = 50}
			isFaster ? temp.delay -= change : temp.delay += change
		}
		props.update(temp);
	}

	function toggleBorders() {
		if (props.params.cellBorders) {
			styleSheet.insertRule(`.on {border: none}`, 1);
		} else {
		styleSheet.deleteRule(1);
		}
		toggleParam('cellBorders');
	}

	function toggleParam(x) {
		var temp = clone(props.params);
		temp[x] = !temp[x];
		props.update(temp);
	}

    return(<nav id='nav' className='nav'>
        <div className='nav__top-btns'>
            <button onClick={props.clearGrid}>{svgs.stop}</button>
            <button onClick={() => toggleParam('isPoused')}>
                { props.params.isPoused ? svgs.play : svgs.pause }
            </button>
            <button onClick={props.randomize}>{svgs.random}</button>
        </div>
        <h3>Randomize Rate</h3>
        <span className='nav__spawn-rate'>
            <button onClick={() => spawnRate(false)}>-</button>
                <h2>{(Math.round(props.params.spawnRate*100)/10).toFixed(1) + ' in 10'}</h2>
            <button onClick={() => spawnRate(true)}>+</button>
        </span>
        <h3>Speed Delay</h3>
        <span className='nav__speed'>
            <button onClick={() => changeSpeed(true)}>-</button>
                <h2>{props.params.delay < 1000 ? props.params.delay + 'ms' : (props.params.delay/1000).toFixed(2) + 's'}</h2>
            <button onClick={() => changeSpeed(false)}>+</button>
        </span>

        <div className='nav__bottom-btns'>
            <button onClick={toggleBorders}>{props.params.cellBorders ? 'Cell Borders On' : 'Cell Borders Off'}</button>
            <button onClick={() => toggleParam('seasons')}>{props.params.seasons ? 'Seasons On' : 'Seasons Off'}</button>
            <button onClick={() => toggleParam('randomBirth')}>{props.params.randomBirth ? 'Spontaneous Spawns On' : 'Spontaneous Spawns Off'}</button>
        </div>

    </nav>);
}

ReactDOM.render(<Main/>, document.getElementById('main'));
// react //

document.getElementById('navOnOff').addEventListener('click', toggleNav);

