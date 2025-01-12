let state = {
    knowledge: 0,
    energy: 100,
    level: 1,
    money: 0,
    skills: {
        programming: 1,
        writing: 1,
        fitness: 1,
        gaming: 1
    },
    buffs: {
        hasBook: false,
        hasGym: false
    }
};

// 随机事件列表
const events = [
    {
        name: "灵感突现",
        trigger: () => {
            state.knowledge += 50;
            showMessage("你突然想通了一个难题，获得50点知识！");
        }
    },
    {
        name: "体力充沛",
        trigger: () => {
            state.energy = Math.min(state.energy + 50, 100);
            showMessage("今天特别有精神，恢复50点体力！");
        }
    },
    {
        name: "意外之财",
        trigger: () => {
            state.money += 100;
            showMessage("路上捡到了100金币！");
        }
    }
];

// 在文件开头添加音频控制变量
let isBGMPlaying = false;
let isSFXEnabled = true;

// 添加音频控制函数
function initAudio() {
    const bgMusic = document.getElementById('bgMusic');
    const toggleBGM = document.getElementById('toggleBGM');
    const toggleSFX = document.getElementById('toggleSFX');
    
    // 背景音乐控制
    toggleBGM.addEventListener('click', () => {
        if (isBGMPlaying) {
            bgMusic.pause();
            toggleBGM.classList.add('muted');
        } else {
            bgMusic.play();
            toggleBGM.classList.remove('muted');
        }
        isBGMPlaying = !isBGMPlaying;
    });
    
    // 音效控制
    toggleSFX.addEventListener('click', () => {
        isSFXEnabled = !isSFXEnabled;
        toggleSFX.classList.toggle('muted');
    });
}

// 播放音效的通用函数
function playSFX(soundId) {
    if (isSFXEnabled) {
        const sound = document.getElementById(soundId);
        sound.currentTime = 0;
        sound.play();
    }
}

function updateDisplay() {
    // 更新数值显示
    document.getElementById('knowledge').textContent = state.knowledge;
    document.getElementById('energy').textContent = state.energy;
    document.getElementById('level').textContent = state.level;
    document.getElementById('money').textContent = state.money;
    document.getElementById('programming').textContent = state.skills.programming;
    document.getElementById('writing').textContent = state.skills.writing;
    document.getElementById('fitness').textContent = state.skills.fitness;

    // 更新进度条
    const knowledgeProgress = (state.knowledge % (state.level * 100)) / (state.level * 100) * 100;
    const energyProgress = state.energy;
    
    document.getElementById('knowledge-progress').style.width = `${knowledgeProgress}%`;
    document.getElementById('energy-progress').style.width = `${energyProgress}%`;
}

function checkLevelUp() {
    if (state.knowledge >= state.level * 100) {
        state.level++;
        playSFX('levelUpSound');
        showMessage(`恭喜！你升级到了 ${state.level} 级！`);
    }
}

function showMessage(text) {
    document.getElementById('message').textContent = text;
}

function triggerRandomEvent() {
    if (Math.random() < 0.1) { // 10%概率触发随机事件
        const event = events[Math.floor(Math.random() * events.length)];
        event.trigger();
        updateDisplay();
    }
}

function study(skill) {
    if (state.energy >= 10) {
        playSFX('clickSound');
        const baseKnowledge = 10;
        let knowledgeGain = baseKnowledge;
        
        // 根据技能等级和道具加成计算获得的知识
        if (skill === 'programming') {
            knowledgeGain *= (1 + (state.skills.programming - 1) * 0.1);
            if (state.buffs.hasBook) knowledgeGain *= 1.5;
            state.skills.programming += Math.random() < 0.3 ? 1 : 0;
        } else if (skill === 'writing') {
            knowledgeGain *= (1 + (state.skills.writing - 1) * 0.1);
            if (state.buffs.hasBook) knowledgeGain *= 1.5;
            state.skills.writing += Math.random() < 0.3 ? 1 : 0;
        }

        state.knowledge += Math.floor(knowledgeGain);
        state.energy -= 10;
        showMessage(`你学习了${skill === 'programming' ? '编程' : '写作'}，获得了${Math.floor(knowledgeGain)}点知识！`);
        triggerRandomEvent();
        updateDisplay();
        checkLevelUp();
    } else {
        showMessage('体力不足，需要休息！');
    }
}

function exercise() {
    if (state.energy >= 20) {
        playSFX('clickSound');
        let energyCost = 20;
        let knowledgeGain = 5;
        
        if (state.buffs.hasGym) {
            energyCost = 15;
            knowledgeGain = 8;
        }

        state.knowledge += knowledgeGain;
        state.energy -= energyCost;
        state.skills.fitness += Math.random() < 0.3 ? 1 : 0;
        
        showMessage('锻炼让你更强壮了！');
        triggerRandomEvent();
        updateDisplay();
        checkLevelUp();
    } else {
        showMessage('体力不足，需要休息！');
    }
}

function work() {
    document.getElementById('workGame').style.display = 'block';
    // 添加遮罩
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
}

function exitWorkGame() {
    document.getElementById('workGame').style.display = 'none';
    // 移除遮罩
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
    
    if (isGameRunning) {
        clearInterval(gameTimer);
        endGame();
    }
}

function startTypingGame() {
    if (isGameRunning) return;
    
    if (state.energy < 30) {
        showMessage('体力不足，无法工作！');
        return;
    }

    playSFX('clickSound');
    isGameRunning = true;
    timeLeft = 30;
    currentScore = 0;
    document.getElementById('timeLeft').textContent = timeLeft;
    document.getElementById('score').textContent = currentScore;
    document.getElementById('wordInput').value = '';
    document.getElementById('wordInput').focus();

    showNextWord();
    
    gameTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timeLeft').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function showNextWord() {
    const word = words[Math.floor(Math.random() * words.length)];
    document.getElementById('wordDisplay').textContent = word;
}

function checkWord() {
    const input = document.getElementById('wordInput');
    const currentWord = document.getElementById('wordDisplay').textContent;
    
    if (input.value === currentWord) {
        playSFX('correctSound');
        currentScore += currentWord.length;
        document.getElementById('score').textContent = currentScore;
        input.value = '';
        showNextWord();
    }
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameTimer);
    
    // 计算奖励
    const baseReward = Math.floor(currentScore / 2);
    const skillBonus = (state.skills.programming + state.skills.writing + state.skills.fitness) * 2;
    const totalReward = baseReward + skillBonus;
    
    state.money += totalReward;
    state.energy -= 30;
    
    showMessage(`太棒了！你赚到了 ${totalReward} 金币！`);
    updateDisplay();
    
    // 重置游戏界面
    document.getElementById('wordInput').value = '';
    document.getElementById('wordDisplay').textContent = '游戏结束！';
}

function rest() {
    playSFX('clickSound');
    state.energy = Math.min(100, state.energy + 30);
    showMessage('休息恢复了体力！');
    triggerRandomEvent();
    updateDisplay();
}

function buyBook() {
    if (state.money >= 50) {
        state.money -= 50;
        state.buffs.hasBook = true;
        showMessage('购买了书籍，学习效率提升50%！');
        updateDisplay();
    } else {
        showMessage('金币不足！');
    }
}

function buyGym() {
    if (state.money >= 100) {
        state.money -= 100;
        state.buffs.hasGym = true;
        showMessage('购买了健身卡，锻炼更有效率！');
        updateDisplay();
    } else {
        showMessage('金币不足！');
    }
}

function completeGrowth() {
    if (state.money >= 10000) {
        state.money = 100000000000;  // 设置一个巨大的金币数
        showMessage('恭喜你完成了人生的成长之路！');
        updateDisplay();
    } else {
        showMessage('金币不足！还需要继续努力！');
    }
}

const words = [
    "编程是一门艺术", "努力学习", "坚持不懈", "追求梦想", 
    "勇往直前", "专注开发", "解决问题", "创新思维",
    "团队协作", "代码优化", "技术革新", "持续进步",
    "算法设计", "数据结构", "系统架构", "用户体验"
];

let gameTimer;
let timeLeft;
let currentScore;
let isGameRunning = false;

// 添加输入监听
document.getElementById('wordInput').addEventListener('input', checkWord);

// 初始化显示
updateDisplay();

// 在文件末尾初始化音频
initAudio();

// 游戏选择相关函数
function showGames() {
    if (state.energy < 20) {
        showMessage('体力不足，无法游戏！');
        return;
    }
    document.getElementById('gameSelection').style.display = 'block';
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
}

function exitGameSelection() {
    document.getElementById('gameSelection').style.display = 'none';
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
}

// 贪吃蛇游戏
let snake = {
    body: [],
    direction: 'right',
    food: null,
    score: 0,
    gameLoop: null,
    ctx: null,
    
    init() {
        const canvas = document.getElementById('snakeCanvas');
        this.ctx = canvas.getContext('2d');
        this.body = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.spawnFood();
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.gameLoop = setInterval(this.update.bind(this), 100);
    },
    
    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * 40),
            y: Math.floor(Math.random() * 40)
        };
    },
    
    update() {
        const head = {...this.body[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        if (head.x < 0 || head.x >= 40 || head.y < 0 || head.y >= 40) {
            this.endGame();
            return;
        }
        
        this.body.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('snakeScore').textContent = this.score;
            this.spawnFood();
        } else {
            this.body.pop();
        }
        
        this.draw();
    },
    
    draw() {
        this.ctx.clearRect(0, 0, 400, 400);
        
        // 画食物
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.food.x * 10, this.food.y * 10, 10, 10);
        
        // 画蛇
        this.ctx.fillStyle = 'green';
        this.body.forEach(part => {
            this.ctx.fillRect(part.x * 10, part.y * 10, 10, 10);
        });
    },
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp': if(this.direction !== 'down') this.direction = 'up'; break;
            case 'ArrowDown': if(this.direction !== 'up') this.direction = 'down'; break;
            case 'ArrowLeft': if(this.direction !== 'right') this.direction = 'left'; break;
            case 'ArrowRight': if(this.direction !== 'left') this.direction = 'right'; break;
        }
    },
    
    endGame() {
        clearInterval(this.gameLoop);
        const gameReward = Math.floor(this.score / 2);
        state.money += gameReward;
        state.energy -= 20;
        state.skills.gaming += Math.random() < 0.3 ? 1 : 0;
        showMessage(`游戏结束！获得 ${gameReward} 金币！`);
        updateDisplay();
        exitSnakeGame();
    }
};

function startSnake() {
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('snakeGame').style.display = 'block';
    snake.init();
}

function exitSnakeGame() {
    document.getElementById('snakeGame').style.display = 'none';
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
    if (snake.gameLoop) clearInterval(snake.gameLoop);
}

// 俄罗斯方块游戏
let tetris = {
    grid: [],
    currentPiece: null,
    score: 0,
    level: 1,
    gameLoop: null,
    ctx: null,
    
    // 定义方块形状
    shapes: [
        [[1,1,1,1]], // I
        [[1,1,1],[0,1,0]], // T
        [[1,1,1],[1,0,0]], // L
        [[1,1,1],[0,0,1]], // J
        [[1,1],[1,1]], // O
        [[1,1,0],[0,1,1]], // Z
        [[0,1,1],[1,1,0]] // S
    ],
    
    colors: [
        '#00f0f0', // I - 青色
        '#a000f0', // T - 紫色
        '#f0a000', // L - 橙色
        '#0000f0', // J - 蓝色
        '#f0f000', // O - 黄色
        '#f00000', // Z - 红色
        '#00f000'  // S - 绿色
    ],
    
    init() {
        const canvas = document.getElementById('tetrisCanvas');
        this.ctx = canvas.getContext('2d');
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        document.getElementById('tetrisScore').textContent = this.score;
        document.getElementById('tetrisLevel').textContent = this.level;
        this.spawnPiece();
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.gameLoop = setInterval(this.update.bind(this), 1000 - (this.level - 1) * 50);
    },
    
    spawnPiece() {
        const shapeIndex = Math.floor(Math.random() * this.shapes.length);
        this.currentPiece = {
            shape: this.shapes[shapeIndex],
            color: this.colors[shapeIndex],
            x: 3,
            y: 0
        };
        
        if (this.checkCollision()) {
            this.endGame();
        }
    },
    
    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const newX = this.currentPiece.x + x;
                    const newY = this.currentPiece.y + y;
                    
                    if (newX < 0 || newX >= 10 || newY >= 20 || 
                        (newY >= 0 && this.grid[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    
    rotatePiece() {
        const newShape = this.currentPiece.shape[0].map((_, i) => 
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const oldShape = this.currentPiece.shape;
        const oldX = this.currentPiece.x;
        this.currentPiece.shape = newShape;
        
        // 尝试不同的位置来适应旋转
        let offset = 0;
        let kicked = false;
        
        // 检查原位置
        if (!this.checkCollision()) {
            kicked = true;
        }
        
        // 尝试向左移动
        if (!kicked) {
            for (let i = 1; i <= 2; i++) {
                this.currentPiece.x = oldX - i;
                if (!this.checkCollision()) {
                    kicked = true;
                    break;
                }
                this.currentPiece.x = oldX;
            }
        }
        
        // 尝试向右移动
        if (!kicked) {
            for (let i = 1; i <= 2; i++) {
                this.currentPiece.x = oldX + i;
                if (!this.checkCollision()) {
                    kicked = true;
                    break;
                }
                this.currentPiece.x = oldX;
            }
        }
        
        // 如果所有位置都不行，恢复原状
        if (!kicked) {
            this.currentPiece.shape = oldShape;
            this.currentPiece.x = oldX;
        }
        
        this.draw();
    },
    
    update() {
        this.currentPiece.y++;
        
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.mergePiece();
            this.clearLines();
            this.spawnPiece();
        }
        
        this.draw();
    },
    
    mergePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const newY = this.currentPiece.y + y;
                    if (newY >= 0) {
                        this.grid[newY][this.currentPiece.x + x] = this.currentPiece.color;
                    }
                }
            }
        }
    },
    
    clearLines() {
        for (let y = this.grid.length - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(10).fill(0));
                this.score += 100 * this.level;
                document.getElementById('tetrisScore').textContent = this.score;
                
                if (this.score >= this.level * 1000) {
                    this.level++;
                    document.getElementById('tetrisLevel').textContent = this.level;
                    clearInterval(this.gameLoop);
                    this.gameLoop = setInterval(this.update.bind(this), 1000 - (this.level - 1) * 50);
                }
            }
        }
    },
    
    draw() {
        this.ctx.clearRect(0, 0, 300, 600);
        
        // 画网格
        this.ctx.strokeStyle = '#ccc';
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.grid[y][x];
                    this.ctx.fillRect(x * 30, y * 30, 30, 30);
                }
                this.ctx.strokeRect(x * 30, y * 30, 30, 30);
            }
        }
        
        // 画当前方块
        this.ctx.fillStyle = this.currentPiece.color;
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.ctx.fillRect(
                        (this.currentPiece.x + x) * 30,
                        (this.currentPiece.y + y) * 30,
                        30, 30
                    );
                }
            }
        }
    },
    
    handleKeyPress(e) {
        // 防止 Tab 键的默认行为（切换焦点）
        if (e.key === 'Tab') {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowLeft':
                this.currentPiece.x--;
                if (this.checkCollision()) this.currentPiece.x++;
                break;
            case 'ArrowRight':
                this.currentPiece.x++;
                if (this.checkCollision()) this.currentPiece.x--;
                break;
            case 'ArrowDown':
                this.currentPiece.y++;
                if (this.checkCollision()) {
                    this.currentPiece.y--;
                    this.mergePiece();
                    this.clearLines();
                    this.spawnPiece();
                }
                break;
            case 'Tab':  // 改为 Tab 键旋转
                this.rotatePiece();
                break;
        }
        this.draw();
    },
    
    endGame() {
        clearInterval(this.gameLoop);
        const gameReward = Math.floor(this.score / 2);
        state.money += gameReward;
        state.energy -= 20;
        state.skills.gaming += Math.random() < 0.3 ? 1 : 0;
        showMessage(`游戏结束！获得 ${gameReward} 金币！`);
        updateDisplay();
        exitTetrisGame();
    }
};

function startTetris() {
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('tetrisGame').style.display = 'block';
    tetris.init();
}

function exitTetrisGame() {
    document.getElementById('tetrisGame').style.display = 'none';
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
    if (tetris.gameLoop) clearInterval(tetris.gameLoop);
}

// 在 game.js 中添加游戏说明配置
const gameInstructions = {
    snake: {
        title: "🐍 贪吃蛇",
        description: "控制贪吃蛇吃取食物，让它不断成长。注意不要撞到墙壁或自己的身体！",
        controls: [
            "↑ 向上移动",
            "↓ 向下移动",
            "← 向左移动",
            "→ 向右移动"
        ],
        rules: [
            "每吃到一个食物得10分",
            "撞墙或撞到自己游戏结束",
            "得分越高获得的金币越多",
            "消耗20点体力"
        ]
    },
    tetris: {
        title: "🟦 俄罗斯方块",
        description: "经典的俄罗斯方块游戏，通过旋转和移动方块来消除行数。随着等级提升，方块下落速度会越来越快！",
        controls: [
            "← 方块左移",
            "→ 方块右移",
            "↓ 加速下落",
            "Tab 旋转方块"
        ],
        rules: [
            "消除一行得100×当前等级分",
            "每1000分提升一个等级",
            "等级越高下落速度越快",
            "消耗20点体力"
        ]
    }
};

// 修改游戏选择按钮的点击事件
function showGameInstructions(gameType) {
    const info = gameInstructions[gameType];
    
    // 创建说明窗口
    const instructionsWindow = document.createElement('div');
    instructionsWindow.className = 'instructions-window';
    instructionsWindow.innerHTML = `
        <div class="instructions-content">
            <h2>${info.title}</h2>
            <div class="instructions-section">
                <h3>游戏说明</h3>
                <p>${info.description}</p>
            </div>
            <div class="instructions-section">
                <h3>操作方式</h3>
                <ul>
                    ${info.controls.map(control => `<li>${control}</li>`).join('')}
                </ul>
            </div>
            <div class="instructions-section">
                <h3>游戏规则</h3>
                <ul>
                    ${info.rules.map(rule => `<li>${rule}</li>`).join('')}
                </ul>
            </div>
            <div class="instructions-buttons">
                <button onclick="startGame('${gameType}')">开始游戏</button>
                <button onclick="closeInstructions()">返回</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(instructionsWindow);
}

function closeInstructions() {
    const instructionsWindow = document.querySelector('.instructions-window');
    if (instructionsWindow) {
        instructionsWindow.remove();
    }
}

function startGame(gameType) {
    closeInstructions();
    if (gameType === 'snake') {
        startSnake();
    } else if (gameType === 'tetris') {
        startTetris();
    }
}

// 修改 HTML 中的游戏按钮
document.querySelector('.game-options').innerHTML = `
    <button onclick="showGameInstructions('snake')">🐍 贪吃蛇</button>
    <button onclick="showGameInstructions('tetris')">🟦 俄罗斯方块</button>
`; 