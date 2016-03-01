
(function main() {
var assetsDir = 'static/_games/penguin/assets';
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

        this.load.image('bgTitle', assetsDir + '/sprites/title_screen.png'),
        this.load.image('bgMain', assetsDir + '/sprites/background.png'),
        this.load.image('hill', assetsDir + '/sprites/hill.png'),
        this.load.spritesheet('character', assetsDir + '/sprites/character.png', 285, 380),
        this.load.spritesheet('bird', assetsDir + '/sprites/bird.png', 170, 122),

        this.load.audio('sound_holy', assetsDir + '/audio/holy.mp3'),
        this.load.audio('sound_fanfare', assetsDir + '/audio/fanfare.mp3'),
        this.load.audio('sound_smash', assetsDir + '/audio/strike.mp3')
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
        this.background = this.add.sprite(0, 0, 'bgTitle');
        this.input.onDown.add(this.onDown, this);
    },
    onDown: function(pointer) {
        this.state.start('main');
    }
},

MyGame.mainState = function(t) {},
MyGame.mainState.prototype = {
    init: function() {
        this.score = 0;
        this.velocityMultiplier = 2;
        this.gameTimer = 0;
        this.inactiveDelay = 30;
        this.nextBirdDelay = 30;
        this.isActive = true;
        this.lives = 1;

    },

    create: function() {
        this.add.sprite(0, 0, "bgMain");

        this.input.onDown.add(this.onDown, this);

        this.hills = this.add.group();
        for (var i = 0; i < 4; i++) {
            var hill = this.hills.create(0, 10, 'hill');
            hill.anchor.x = 0.5
            if (i == 0 || i == 1) {
                hill.x = this.game.width - hill.width;
            } else hill.x = 230;
            if (i == 0 || i == 3) {
                hill.y = 350;
            } else hill.y = 450;
            if (i >= 2) hill.scale.x = -1;
            hill.tint = 0x000000;
        }

        this.character = this.add.sprite(0, 0, 'character');
        this.character.enableBody = true;

        this.character.x = this.game.width / 2;
        this.character.y = this.game.height - this.character.height;
        this.character.anchor.x = 0.5;
        this.character.handPosition = -1;
        this.game.physics.enable(this.character, Phaser.Physics.ARCADE);
        this.character.body.setSize(125, 380, 0, 0);

        this.character.animations.add('idle', [3], 0, true);
        this.character.animations.add('angry', [0], 0, true);

        this.character.animations.add('low', [2], 0, true);
        this.character.animations.add('high', [4], 0, true);
        this.character.animations.add('catch', [1], 0, true);

        this.character.animations.play('idle');

        this.penguins = this.add.group();
        this.penguins.enableBody = true;
        this.addPenguin();

        this.scoreText = this.add.text(this.game.width / 2, 50, this.score, { font: "80px Arial", fill: "#ffffff" });

        this.scoreText.anchor.x = 0.5;

        this.timer = this.time.create(false);
        this.timer.loop(100, this.timerLoop, this);
        this.timer.start();

        this.soundHoly = this.add.audio("sound_holy");
        this.soundSmash = this.add.audio("sound_smash");
    },
    update: function() {
        this.character.body.velocity.x *= this.velocityMultiplier;
        this.character.body.velocity.y *= this.velocityMultiplier;
        this.scoreText.text = this.score;

        if (this.isActive) this.game.physics.arcade.overlap(this.character, this.penguins,
            function(character, penguin) {
                if (character.handPosition == penguin.stagePosition) {
                    this.soundHoly.play();
                    penguin.kill();
                    this.score += 1;
                    character.animations.play("catch");
                    if (this.score % 3 == 0) {
                        this.nextBirdDelay -= 2;
                        if (this.nextBirdDelay < 5) this.nextBirdDelay = 5;
                    }
                }
            },
            null, this);
        this.penguins.forEach(function(item) {
            if (!this.isActive) item.body.velocity.x = item.body.velocity.y = 0;

            if ((item.body.velocity.x > 0 && item.x > 400) ||
                (item.body.velocity.x < 0 && item.x < this.game.width - 400 + item.width/2)) {
                this.soundSmash.play();
                this.isActive = false;
                item.y = this.game.height - item.height;
                this.character.animations.play("angry");
                this.lives--;
                this.gameTimer = 0;
                return;
            }

        }, this);
    },
    timerLoop: function() {
        this.gameTimer++;
        if (this.isActive) {
            if (this.gameTimer >= this.nextBirdDelay) {
                this.gameTimer = 0;
                this.addPenguin();
            }
        }
        else {
            if (this.gameTimer >= this.inactiveDelay) {
                if (this.lives <= 0) {
                    this.game.globalScore = this.score;
                    this.state.start('finish');

                }
                this.gameTimer = 0;
                this.isActive = true;
                this.character.handPosition = -1;
                this.character.animations.play("idle");
                this.nextBirdDelay += 10;
                if (this.nextBirdDelay > 30) this.nextBirdDelay = 30;
                this.penguins.forEach(function(item) { item.kill(); }, this);
            }
        }
    },
    onDown: function(pointer) {
        if (!this.isActive && this.lives <= 0) {
            this.game.globalScore = this.score;
            this.state.start('finish');
        }
        if (pointer.worldX > this.game.width / 2 && pointer.worldY < 450) {
            this.character.handPosition = 0;
            this.character.animations.play('high');
            this.character.scale.x = -1;
        }
        else if (pointer.worldX > this.game.width / 2 && pointer.worldY >= 450) {
            this.character.handPosition = 1;
            this.character.animations.play('low');
            this.character.scale.x = -1;
        }
        if (pointer.worldX < this.game.width / 2 && pointer.worldY > 450) {
            this.character.handPosition = 2;
            this.character.animations.play('low');
            this.character.scale.x = 1;
        }
        else if (pointer.worldX < this.game.width / 2 && pointer.worldY < 450) {
            this.character.handPosition = 3;
            this.character.animations.play('high');
            this.character.scale.x = 1;
        }
    },

    addPenguin: function() {
        var penguin = this.penguins.create(0, 0, 'bird');
        penguin.animations.add('go', [Math.floor(Math.random()*2)], 0, true);
        penguin.animations.play('go');
        penguin.anchor.x = 0.5;
        penguin.stagePosition = Math.floor(Math.random() * 4);
        if (penguin.stagePosition <= 1) {
            penguin.x = this.game.width + penguin.width;
            penguin.body.velocity.x = -100;
        } else {
            penguin.x = -penguin.width;
            penguin.body.velocity.x = 100;
            penguin.scale.x *= -1;
        }
        penguin.body.velocity.y = 30;
        if (penguin.stagePosition == 0 || penguin.stagePosition == 3) {
            penguin.y = 270 - penguin.height;
        } else penguin.y = 370 - penguin.height;
    }
},

MyGame.finishState = function(t) {},
MyGame.finishState.prototype = {
    init: function() {
        this.stateTimer = 0;
        this.canReplay = false;

    },

    create: function() {
        this.add.sprite(0, 0, "bgMain");
        this.finishText = this.add.text(this.game.width/2, 100, "Вы покрестили\nпингвинов:\n" + this.game.globalScore,
            {font: "80px Arial", fill: "#000000", align: "center"});
        this.finishText.anchor.x = 0.5;


        this.replayText = this.add.text(this.game.width/2, 400, "Сыграть снова!", {font: "80px Arial", fill: "#000000"});
        this.replayText.visible = false;
        this.replayText.anchor.x = 0.5;

        this.input.onDown.add(this.onDown, this);

        this.timer = this.time.create(false);
        this.timer.loop(1000, function() {
            this.stateTimer++;
            if (this.stateTimer > 1) this.replayText.visible = true;

            if (this.stateTimer > 2) this.canReplay = true;
        }, this);
        this.timer.start();

        this.soundFanfare = this.add.audio("sound_fanfare");
        this.soundFanfare.play();


    },
    onDown: function(pointer) {

        if (this.canReplay) this.state.start('main');
        else {
            this.replayText.visible = true;
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
