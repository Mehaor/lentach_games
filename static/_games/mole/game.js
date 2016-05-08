
(function main() {
var assetsDir = '_games/mole/assets';
var MyGame = {};


MyGame.bootState = function(t) {},
MyGame.bootState.prototype = {
    preload: function() {},
    create: function() {
        this.game.scale.maxWidth = window.innerHeight * 1.5;
        this.game.scale.maxHeight = window.innerHeight;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.state.start('preload');
    }
},

MyGame.preloadState = function(t) {},
MyGame.preloadState.prototype = {
    init: function() { },
    preload: function() {
        this.text = this.add.text(this.game.width/2, this.game.height/2, 'загрузка', {fill: '#ffffff'});
        this.text.anchor.set(0.5, 0.5);
        this.load.onFileComplete.add(this.fileComplete, this);

        this.load.image('title', assetsDir + '/sprites/title.png'),
        this.load.image('bgTotals', assetsDir + '/sprites/totals_wb.png'),
        this.load.image('buttonRestart', assetsDir + '/sprites/restart_button.png'),
        this.load.image('bg', assetsDir + '/sprites/bg.png'),
        this.load.spritesheet('head', assetsDir + '/sprites/heads_hole.png', 204, 180),
        this.load.audio('sound_fanfare', assetsDir + '/audio/fanfare.mp3'),
        this.load.audio('sound_smash', assetsDir + '/audio/strike.mp3'),
        this.load.audio('sound_error', assetsDir + '/audio/error.mp3')
    },

    create: function() { this.state.start('title'); },

    fileComplete: function(progress) { this.text.text = 'загрузка ' + progress + '%'; }
},

MyGame.titleScreenState = function(t) {},
MyGame.titleScreenState.prototype = {
    init: function(){
        this.game.globalScore = 0;
        this.game.currentLevel = -1;
    },
    create: function() {
        this.add.sprite(0, 0, 'title');
        this.input.onDown.add(this.onDown, this);
    },
    onDown: function(pointer) { this.state.start('main');  }
},

MyGame.mainState = function(t) {},
MyGame.mainState.prototype = {
    init: function() {
        this.score = 0;
        this.gameTimer = 0;
        this.inactiveDelay = 30;
        this.nextHeadDelay = 10;
        this.headStayDelay = 20;
        this.isActive = true;
        this.lives = 1;
        this.holes = [0, 0, 0, 0, 0, 0];
    },

    create: function() {
        this.add.sprite(0, 0, 'bg');
        this.heads = this.add.group();
        this.timer = this.time.create(false);
        this.timer.loop(100, this.timerLoop, this);
        this.timer.start();
        this.soundSmash = this.add.audio("sound_smash");
        this.soundError = this.add.audio("sound_error");
    },

    timerLoop: function() {
        this.gameTimer++;
        if (!this.isActive) {
            if (this.gameTimer > this.inactiveDelay) {
                this.gameTimer = 0;
                if (this.lives > 0 ) {
                    this.isActive = true;
                    this.holes = [0, 0, 0, 0, 0, 0];
                    this.heads.removeAll();
                    this.nextHeadDelay += 5;
                    this.headStayDelay += 5;
                } else {
                    this.game.globalScore = this.score;
                    this.state.start('finish');
                }
            }
        }
        else {
            if (this.gameTimer > this.nextHeadDelay) {
                this.gameTimer = 0;
                this.addHead();
            }
            this.heads.forEach(function (head) {
                if (head.isRemoving) return;
                head.timer++;
                if (head.timer > this.headStayDelay) this.removeHead(head);
            }, this);
        }
    },

    addHead: function() {
        var emptyHoleIndexes = [];
        for (var i = 0; i < 6; i++) { if (this.holes[i] == 0) emptyHoleIndexes.push(i); }
        if (emptyHoleIndexes.length == 0) return;
        var holeInd = emptyHoleIndexes[Math.floor(Math.random() * emptyHoleIndexes.length)];
        this.holes[holeInd] = 1;
        var spriteRow = Math.floor(Math.random() * 8);
        var head = this.heads.create(95 + 250 * (holeInd % 3),
                                    120 + 150 * Math.floor( holeInd / 3), 'head');

        head.animations.add('appear', [4 * spriteRow, 1 + 4 * spriteRow, 2 + 4 * spriteRow], 10, false);
        head.animations.add('disappear', [2 + 4 * spriteRow, 1 + 4 * spriteRow, 4 * spriteRow], 10, false);
        head.animations.add('clicked', [3 + 4 * spriteRow, 3 + 4 * spriteRow, 3 + 4 * spriteRow,
            3 + 4 * spriteRow, 1 + 4 * spriteRow, 4 * spriteRow], 10, false);
        head.animations.play('appear');
        head.isClicked = false;
        head.isRemoving = false;
        head.holeIndex = holeInd;
        head.inputEnabled = true;
        head.timer = 0;
        head.events.onInputDown.add(this.headClick, this);
    },

    headClick: function(head) {
        if (head.isClicked || !this.isActive) return;
        this.soundSmash.play();
        this.score++;
        head.isClicked = true;
        if (this.score % 5 == 0) {
            this.headStayDelay--;
            this.nextHeadDelay--;
            if (this.headStayDelay < 5) this.headStayDelay = 5;
            if (this.nextHeadDelay < 1) this.nextHeadDelay = 1;
        }

        this.removeHead(head);
    },

    removeHead: function(head) {
        if (head.isClicked) head.animations.play('clicked');
        else head.animations.play('disappear');
        head.isRemoving = true;
        head.animations.currentAnim.onComplete.add(function (head) {
            if (!head.isClicked) {
                this.isActive = false;
                this.gameTimer = 0;
                this.lives--;
                this.soundError.play();
            } else { this.holes[head.holeIndex] = 0; }
            head.kill();
        }, this);
    },

    update: function() {},

    onDown: function(pointer) { }

},

MyGame.finishState = function(t) {},
MyGame.finishState.prototype = {
    init: function() {
        this.stateTimer = 0;
        this.canReplay = false;

    },

    create: function() {
        this.add.sprite(0, 0, 'bgTotals');
        this.finishText = this.add.text(this.game.width/2, 250, this.game.globalScore,
            {font: "60px Arial", fill: "#fff", align: "center"});
        this.finishText.anchor.x = 0.5;

        this.replayButton = this.add.sprite(this.game.width/2, 400, 'buttonRestart');
        this.replayButton.visible = false;
        this.replayButton.anchor.x = 0.5;

        this.input.onDown.add(this.onDown, this);

        this.timer = this.time.create(false);
        this.timer.loop(1000, function() {
            this.stateTimer++;
            if (this.stateTimer > 1) this.replayButton.visible = true;

            if (this.stateTimer > 2) this.canReplay = true;
        }, this);
        this.timer.start();

        this.soundFanfare = this.add.audio("sound_fanfare");
        this.soundFanfare.play();
    },

    onDown: function(pointer) {
        if (this.canReplay) this.state.start('main');
        else {
            this.replayButton.visible = true;
            this.canReplay = true;
        }
    }
};

window.onload = function() {
    var t = new Phaser.Game(900, 600, Phaser.AUTO, 'game_container');
    t.global = {},
        t.state.add('boot', MyGame.bootState),
        t.state.add('preload', MyGame.preloadState),
        t.state.add('title', MyGame.titleScreenState),
        t.state.add('main', MyGame.mainState),
        t.state.add('finish', MyGame.finishState),
        t.state.start('boot');
};

})();

