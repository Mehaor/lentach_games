
(function main() {
var assetsDir = '_games/veteran/assets';
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

        this.load.image('bgTitle', assetsDir + '/sprites/title.png');
        for (var i = 1; i <= 10; i++) {
            var si = i < 10 ? '0' + i.toString() : i.toString();
            this.load.image('bg' + i, assetsDir + '/sprites/' + si + '.png');
        }
        for (i = 1; i <=3; i++) {
            this.load.image('over' + i, assetsDir + '/sprites/over' + i + '.png');
        }
        this.load.image('button', assetsDir + '/sprites/button.png');
        this.load.json('test', assetsDir + '/tst.json');
    },

    create: function() {
        this.state.start('title');
    },

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
        this.totalQuestions = 10;
        this.questionNumber = null;
        this.clickable = false;
        this.answered = false;
        this.currentQuestion = null;
        this.stageTimer = 0;
    },

    create: function() {
        this.stage.backgroundColor = '#43235a';
        this.test = this.cache.getJSON('test');
        this.input.onDown.add(this.onDown, this);
        this.bgs = this.add.group();

        var styleQuestion = { font: "32px Arial", fill: "#fff",
            wordWrap: true, wordWrapWidth: 800, align: "center", boundsAlignV: "middle"};
        this.questionText = this.add.text(this.game.width/2, 210, 'question', styleQuestion);
        this.questionText.anchor.x = 0.5;
        this.questionText.setTextBounds(0, 0, 900, 190);

        this.noteText = this.add.text(this.game.width/2, 300, 'note', styleQuestion);
        this.noteText.anchor.x = 0.5;

        this.btn0 = this.add.sprite(this.game.width/2, 400, 'button');
        this.btn1 = this.add.sprite(this.game.width/2, 500, 'button');
        this.btn0.anchor.x = 0.5;
        this.btn1.anchor.x = 0.5;
        this.btn0.inputEnabled = true;
        this.btn1.inputEnabled = true;
        this.btn0.events.onInputDown.add(this.answerClick, this);
        this.btn1.events.onInputDown.add(this.answerClick, this);

        var style = { font: "32px Arial", fill: "#fff", wordWrap: true, wordWrapWidth: this.btn0.width, align: "center"};
        this.answerText0 = this.add.text(this.game.width/2, 415, '', style);
        this.answerText0.anchor.x = 0.5;
        this.answerText1 = this.add.text(this.game.width/2, 515, '', style);
        this.answerText1.anchor.x = 0.5;

        this.setNextQuestion();
        this.timer = this.time.create(false);
        this.timer.loop(500, this.timerLoop, this);
        this.timer.start();
    },
    timerLoop: function() {
        this.stageTimer++;
        if (this.stageTimer > 1) this.clickable = true;
    },
    answerClick: function(btn) {
        if (!this.clickable || this.answered) return;
        if (btn.isRight) this.score++;
        btn.tint = this.questionText.tint = btn.isRight ? 0x00ff00 : 0xff0000;
        this.questionText.text = btn.note;
        this.clickable = false;
        this.stageTimer = 0;
        this.answered = true;
    },
    setNextQuestion: function() {
        if (this.questionNumber == null) this.questionNumber = 1;
        else this.questionNumber++;
        if (this.questionNumber > this.totalQuestions) {
            this.game.globalScore = this.score;
            this.state.start('finish');
            return;
        }
        this.answered = false;
        this.currentQuestion = this.test.questions[this.questionNumber - 1];
        this.bgs.create(0, -40, 'bg' + this.questionNumber);
        this.questionText.text = this.currentQuestion.question;
        this.noteText.text = '';
        this.btn0.isRight = this.currentQuestion.answers[0].is_right;
        this.btn0.note = this.currentQuestion.answers[0].note;
        this.btn0.tint = this.btn1.tint = this.questionText.tint = 0xffffff;
        this.btn1.isRight = this.currentQuestion.answers[1].is_right;
        this.btn1.note = this.currentQuestion.answers[1].note;
        this.answerText0.text = this.currentQuestion.answers[0].text;
        this.answerText1.text = this.currentQuestion.answers[1].text;

        this.stageTimer = 0;
        this.clickable = false;
    },
    update: function() {

    },
    onDown: function(pointer) { if (this.answered && this.clickable) this.setNextQuestion(); }
},

MyGame.finishState = function(t) {},
MyGame.finishState.prototype = {
    init: function() {
        this.stateTimer = 0;
        this.canReplay = false;
    },

    create: function() {
        console.log(this.game.globalScore);
        if (this.game.globalScore <=3) this.add.sprite(0, 0, 'over1');
        if (this.game.globalScore > 3 && this.game.globalScore < 9) this.add.sprite(0, 0, 'over2');
        if (this.game.globalScore >= 9) this.add.sprite(0, 0, 'over3');
        var style = { font: "80px Arial", fill: "#fff"};
        this.scoreText = this.add.text(this.game.width/2, 60, this.game.globalScore + ' / 10', style);
        this.scoreText.anchor.x = 0.5;
        this.timer = this.time.create(false);
        this.timer.loop(1000, function() {
            this.stateTimer++;
            if (this.stateTimer >= 3) this.canReplay = true;
        }, this);
        this.timer.start();

        this.input.onDown.add(function() {
            if (this.canReplay) this.state.start('main');
        }, this);
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
