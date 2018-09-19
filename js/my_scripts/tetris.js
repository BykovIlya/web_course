const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20,20);
context.fillStyle = '#FFF';
context.fillRect(0, 0, canvas.width, canvas.height);

const  figure = document.getElementById('figure');
const ctx = figure.getContext('2d');
ctx.scale(20,20);
ctx.fillStyle = '#FFF';
ctx.fillRect(0, 0, ctx.width, ctx.height);

let next = -1;
let lastTime = 0;
let counter = 0;
let interval = 1500;
let storedBestScores = [0, 0, 0, 0, 0];
const area = create(12,20);
let audioGameOver = new Audio(); audioGameOver.src = 'audio/gameover.mp3';
let audioClearLine = new Audio(); audioClearLine.src = 'audio/clearLine.mp3';
let audioLevelUp = new Audio(); audioLevelUp.src = 'audio/levelUp.mp3';
const tetraminoes = '1234567';
let round = tetraminoes[tetraminoes.length * Math.random() | 0];

const colors = [
	null,
	'#050',
	'#222',
	'#355',
	'#854',
	'#433',
	'#475',
	'#353',
	'#766',
	'#999',
	'#123',
];

const gamer = {
	goto: {x: 0, y: 0},
	tetramino: null,
	score: 0,
	name: null,
};

function create(i,j) {
	const m = [];
	while (j--) m.push(new Array(i).fill(0));
	return m;
}

function makeBestScores() {
    storedBestScores.pop();
    storedBestScores.push(gamer.score);
    storedBestScores.sort(function (a,b) {
        return b - a;
    });
    localStorage.setItem("bestScores", JSON.stringify(storedBestScores));
}
function start() {
    gamer.tetramino = createTetramino(round);
    round = tetraminoes[tetraminoes.length * Math.random() | 0];
    clearFigure();
    nextFigure(createTetramino(round));
	gamer.goto.y = 0;
	gamer.goto.x = (area[0].length / 2 | 0) - (gamer.tetramino[1].length / 2 | 0);
	if (meeting(area,gamer)) {
		area.forEach(row => row.fill(0));
        if (gamer.score > storedBestScores[4]) {
        	makeBestScores();
            tableScores();
        }

        gameOver();
        gamer.score = 0;
		interval = 1500;
		score();
		speed();
	}
}

function createTetramino(t) {
	if (t === '1') {
        return 	[
        	[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0],
			];
	} else if ( t === '2') {
		return [
			[2, 2],
			[2, 2],
		];
	} else if ( t === '3') {
        return [
        	[0, 0, 0],
            [3, 3, 3],
            [3, 0, 0],
        ];
    } else if ( t === '4') {
        return [
            [4, 0, 0],
			[4, 4, 4],
            [0, 0, 0],
        ];
    }else if (t === '5') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (t === '6') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (t === '7') {
		return [
            [0, 7, 0, 0],
            [0, 7, 0, 0],
            [0, 7, 0, 0],
            [0, 7, 0, 0],
        ];
	}

}

function drawTetramino(tetramino,goto) {
	tetramino.forEach((row,y)=> {
		row.forEach((val,x) => {
			if (val !== 0) {
				context.fillStyle = colors[val];
				context.fillRect(x + goto.x, y + goto.y, 1, 1);
			}
		});
	});
}

function transpose (tetramino) {
	let x = 1;
	for (let i = 0; i < tetramino.length; ++i) {
		for (let j = 0; j < i; ++j) {
			[tetramino[j][i], tetramino[i][j]] = [tetramino[i][j], tetramino[j][i]];
		}
	}
	tetramino.forEach(row=>row.reverse());
	while (meeting(area,gamer)) {
		gamer.goto.x += x;
		x = -(x + (x > 0  ? 1 : -1));
		if (x > gamer.tetramino[0].length) {
            for (let i = 0; i < tetramino.length; ++i) {
                for (let j = 0; j < i; ++j) {
                    [tetramino[j][i], tetramino[i][j]] = [tetramino[i][j], tetramino[j][i]];
                }
            }
            tetramino.reverse();
		}
	}
}

function draw() {
	context.fillStyle = '#fff';
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawTetramino(area, {x: 0, y: 0});
	drawTetramino(gamer.tetramino, gamer.goto);
}

function addTetraminoToArea(area, gamer) {
	gamer.tetramino.forEach((row,y) => {
		row.forEach((val, x) => {
			if (val !== 0) {
				area[y + gamer.goto.y][x + gamer.goto.x] = val;
            }
		});
	});
}

function meeting(area, gamer) {
    const m = gamer.tetramino;
    const o = gamer.goto;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (area[y + o.y] &&
                    area[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function gameOver() {
	audioGameOver.play();
   	let answer = confirm("Game over. Do you want to play more?");
   	if (answer === false) {
   		document.location.href = "index.html";

   	}
}

function down() {
    gamer.goto.y++;
    if (meeting(area,gamer)) {
        gamer.goto.y--;
        addTetraminoToArea(area,gamer);
        start();
        clearLine();
        score();
        speed();
    }
    counter = 0;
}

function move(flag) {
	gamer.goto.x += flag;
	if (meeting(area,gamer)) {
		gamer.goto.x -= flag;
	}
}

function update(nowTime = 0) {
    counter += nowTime - lastTime;
	if (counter > interval) {
		down();
	}
    lastTime = nowTime;
    draw();
	requestAnimationFrame(update);
}

document.addEventListener('keydown',key => {
	if (key.keyCode === 37) {
        move(-1);
    } else if (key.keyCode === 39) {
		move(1);
    } else if (key.keyCode === 40 || key.keyCode === 32) {
		down();
	} else if (key.keyCode === 38) {
		transpose(gamer.tetramino);
	}
});

function score() {
	document.getElementById('score').innerText = gamer.score;
}

function speed() {
	document.getElementById('speed').innerText = Math.floor(150000 / interval) / 100;
}

function tableScores() {
    if (localStorage.getItem("bestScores") === null) {
        localStorage.setItem("bestScores", JSON.stringify(storedBestScores));
    }
    storedBestScores = JSON.parse(localStorage.getItem("bestScores"));
    let e = document.getElementById('scores');
    e.innerHTML = null;
    for (let i = 0; i < storedBestScores.length; i++) {
        e.innerHTML += (i + 1) + ':  ' + storedBestScores[i] + '<br>';
    }
}

function name() {
	document.getElementById('outputName').innerText = gamer.name;
}

function clearLine() {
	let scoreIndex = 100;
	flag: for (let i = area.length - 1; i > 0; --i) {
		for (let j = 0; j < area[i].length; ++j) {
			if (area[i][j] === 0) continue flag;
		}
        gamer.score += scoreIndex;
        //	interval /= 1.1;
        let old_interval = interval;
        levelUp();
        if (old_interval === interval) {
            audioClearLine.play();
        } else {
            audioLevelUp.play();
        }
		const row = area.splice(i, 1)[0].fill(0);
		area.unshift(row);
		++i;
		scoreIndex *= 2;
	}
}

function levelUp() {
    if (gamer.score >= 7000) {		// max level
        interval = 100;
    } else if (gamer.score >= 6000) {
        interval = 200;
    } else if (gamer.score >= 5000) {
        interval = 300;
    } else if (gamer.score >= 4000) {
        interval = 400;
    } else if (gamer.score >= 3500) {
        interval = 500;
    } else if (gamer.score >= 3000) {
        interval = 600;
    } else if (gamer.score >= 2500) {
        interval = 700;
    } else if (gamer.score >= 2000) {
        interval = 800;
    } else if (gamer.score >= 1500) {
        interval = 900;
    } else if (gamer.score >= 1000) {
        interval = 1000;
    } else if (gamer.score >= 800) {
        interval = 1100;
    } else if (gamer.score >= 600) {
        interval = 1200;
    } else if (gamer.score >= 400) {
        interval = 1300;
    } else if (gamer.score >= 200) {
        interval = 1400;
    }
}

function pause() {
	alert("Pause");
}

function nextFigure(tetramino) {
    tetramino.forEach((row,y)=> {
        row.forEach((val,x) => {
            if (val !== 0) {
                ctx.fillStyle = colors[val];
                ctx.fillRect(x+1.2, y+1, 1, 1);
            }
        });
    });
}

function clearFigure() {
	ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 5, 5);
}

gamer.name = localStorage.getItem('#tetris.userName');

name();
start();
score();
speed();
update();
tableScores();

