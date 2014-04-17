require(['dijit/form/Button', 'dojo/domReady!'], function(Button) {
    
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    
    var layer;
    var numPlayers = 6;
    var screenWidth = x;
    var screenHeight = y;
    var poleSpace = Math.floor(screenWidth / numPlayers);
    var barSpace = 40;
    var ladderColor = 'brown';
    var ladderThick = 4;
    
    var ladderTop = 100;
    var heightPoints = Math.floor((screenHeight - ladderTop) / barSpace) - 2;
    
    var opts = {
        boomDuration: 2000,
        allowCrash: true
    };

    function Player(n) {
        this.num = n;
        this.disp = new collie.DisplayObject({
                x: ladder.poles[n].getStart()[0] - 32 / 2,
                y: ladder.poles[n].getStart()[1] - 32 / 2,
                width: 32,
                height: 32,
                backgroundImage: 'p' + n
            });
        this.disp.player = this;
        this.speed = (Math.random() / 2 + 0.5) * 10 / (screenWidth / 480); // ms/px
        this.text = new collie.Text({
            width : poleSpace,
            height : 20,
            x : 'center',
            y : 32,
            fontColor : "#FFFFFF",
            fontSize : 15,
            fontWeight: 'bold',
            textAlign: 'center'
        }).text("인간조우영");
        this.disp.addChild(this.text);
    }
    Player.prototype.run = function () {
        var self = this;
        var currentX = this.disp.get('x');
        var currentY = this.disp.get('y');
        var queue = this.queue = collie.Timer.queue();
        var route1 = findRoute(ladder.poles[this.num]);
        _printRoute(route1);
        
        var walking = this.walking = collie.Timer.cycle(this.disp, '10fps', {
            from: 0,
            to: 1,
            loop: 0
        });
        var lastPoint = route1[0];
        var point;
        var idx = 0;
        var trans;
        while ((point = route1.shift())) {
            queue.transition(this.disp, this.speed * distance(lastPoint, point), {
                to: [point[0] - 16, point[1] - 16],
                set: ['x', 'y']
            });
            lastPoint = point;
            trans = queue.getAnimation(idx);
            (function (idx) {
                trans.attach('complete', function () {
                    queue.currentAnimIndex = idx + 1;
                });
            })(idx);
            idx++;
        }
        queue.attach('complete', function () {
            console.log('queue complete');
            walking.stop();
        });
        queue.attach('stop', function () {
            //walking.stop();
        });
    };
    
    function Goals(n, x, y) {
        this.num = n;
        this.disp = new collie.Text({
            width : 32, // 너비와 높이를 반드시 지정해야 합니다.
            height : 20,
            x : x,
            y : y,
            fontColor : "#FFFFFF",
            fontSize : 15,
            fontWeight: 'bold',
            textAlign: 'center'
        }).text("Goal");
    }
    
    function Pole(num) {
        this.num = num;
        this.height = barSpace * (heightPoints + 1);
        this.bars = [];
        this.next = null;
    }
    Pole.prototype.getX = function () {
        return (this.num * poleSpace) + (poleSpace / 2);
    };
    Pole.prototype.getStart = function () {
        var start = [this.getX(), ladderTop];
        return start;
    };
    Pole.prototype.getEnd = function () {
        var end = [this.getX(), ladderTop + this.height];
        return end;
    };
    Pole.prototype.getLine = function() {
        return [this.getStart(), this.getEnd()];
    };
    Pole.prototype.getNextPosBar = function (pos) {
        var prevBars = this.prev ? this.prev.bars : [];
        var bars = _.union(prevBars, this.bars);
        bars = _.sortBy(bars, function (bar) { return bar.pos; });
        var index = _.sortedIndex(bars, {pos:pos+1}, function (bar) { return bar.pos; });
        return bars[index];
    };
    Pole.prototype.addBar = function (pos) {
        if (!pos) {
            pos = _.random(1, heightPoints);
        }
        var prevBars = this.prev ? this.prev.bars : [];
        var nextBars = this.next ? this.next.bars : [];
        var bars = _.union(prevBars, nextBars, this.bars);
        var b = _.find(bars, function (b) { return b.pos == pos; });
        if (!b) {
            this.bars.push(new Bar(this, pos));
        }
    };
    
    function Bar(pole, pos) {
        this.pole = pole;
        this.pos = pos;
    }
    Bar.prototype.getY = function () {
        return ladderTop + this.pos * barSpace;
    };
    Bar.prototype.getStart = function () {
        var x = this.pole.getX();
        return [x, this.getY()];
    };
    Bar.prototype.getEnd = function () {
        var x = (this.pole.next.num * poleSpace) + (poleSpace / 2);
        return [x, this.getY()];
    };
    Bar.prototype.getLine = function() {
        return [this.getStart(), this.getEnd()];
    };
    
    function Ladder() {
        this.poles = [];
        this.players = [];
    }
    Ladder.prototype.generate = function (numPlayers) {        
        // poles
        this.poles = _.map(_.range(numPlayers), function (n) {
            console.log('n', n);
            return new Pole(n);
        });
        _.reduce(this.poles, function (last, cur) {
            cur.prev = last;
            last.next = cur;
            return cur;
        });
        
        for(var i = 0; i < 5 * numPlayers; i++) {
            var pole = this.poles[_.random(numPlayers - 2)];
            pole.addBar();
        }
        
        // players
        this.players = _.map(_.range(numPlayers), function (n) {
            var player = new Player(n);
            return player;
        });

    };
    Ladder.prototype.run = function () {
        console.log('Run ladder', this);
        _.each(this.players, function (player) { player.run(); });
    };
    
    var pole0 = new Pole(0);
    var pole1 = new Pole(1);
    pole0.next = pole1;
    pole1.prev = pole0;
    var pole2 = new Pole(2);
    pole1.next = pole2;
    pole2.prev = pole1;
    var poles = [pole0, pole1, pole2];
    pole0.bars = [new Bar(pole0, 1), new Bar(pole0, 5), new Bar(pole0, 7)];
    pole1.bars = [new Bar(pole1, 2), new Bar(pole1, 3)];
    
    function drawPole(pole) {
        var line = pole.getLine();
        console.log(pole, line);
        new collie.Polyline({
            strokeColor: ladderColor,
            strokeWidth: ladderThick
        }).addTo(layer).setPointData(line);
        drawBars(pole);
    }
    function drawBars(pole) {
        for(var i in pole.bars) {
            var bar = pole.bars[i];
            new collie.Polyline({
                strokeColor: ladderColor,
                strokeWidth: ladderThick
            }).addTo(layer).setPointData(bar.getLine());
        }
    }
    function drawPlayer(player) {
        player.disp.addTo(layer);
        player.disp.attach({
            click: player.run.bind(player)
        });
    }
    function drawLadder(ladder) {
        _.each(ladder.poles, drawPole);
        _.each(ladder.players, drawPlayer);
    }
    function findRoute(pole) {
        var route = [];
        route.push(pole.getStart());
        var pos = 0;
        var bar;
        for(var i = 0; i < 20; i++) {
            bar = pole.getNextPosBar(pos);
            if (!bar) {
                break;
            }
            if (bar.pole === pole) {
                route.push(bar.getStart());
                route.push(bar.getEnd());
                pole = pole.next;
            } else {
                route.push(bar.getEnd());
                route.push(bar.getStart());
                pole = pole.prev;
            }
            pos = bar.pos;
        }
        route.push(pole.getEnd());
        return route;
    }
    
    var ladder = new Ladder();
    ladder.generate(numPlayers);
    
    function distance(p1, p2) {
        var d1 = p1[0] - p2[0];
        var d2 = p1[1] - p2[1];
        return Math.sqrt(d1 * d1 + d2 * d2);
    }
    
    function _printRoute(route) {
        var output = _.reduce(route, function (result, p) {
            return result + ',('+p[0]+','+p[1]+')';
        }, '');
        console.log(output);
    }
    
    function initLayer() {
        layer = new collie.Layer({
            width: screenWidth,
            height: screenHeight
        });
        collie.ImageManager.add({
            p0: './images/guardian/amg1_fr.gif',
            p1: './images/guardian/avt1_fr.gif',
            p2: './images/guardian/bmg1_fr.gif',
            p3: './images/guardian/chr1_fr.gif',
            p4: './images/guardian/dvl1_fr.gif',
            p5: './images/guardian/ftr1_fr.gif',
            p6: './images/guardian/gsd1_fr.gif',
            p7: './images/guardian/isd1_fr.gif',
            p8: './images/guardian/jli1_fr.gif',
            p9: './images/guardian/kin1_fr.gif',
            bg1: './images/bg1.jpg',
            bg2: './images/bg2.jpg',
            boom: './images/boom.png'
        });
        var bg = new collie.DisplayObject({
            x: 0,
            y: 0,
            width: screenWidth,
            height: screenHeight,
            backgroundImage: 'bg2',
            fitImage: true
        }).addTo(layer);
        
    }
    function startAnim() {
        /*
        new collie.FPSConsole({
            color : "#fff"
        }).load();
        */
        collie.Renderer.addLayer(layer);
        collie.Renderer.load(document.getElementById('container'));
        collie.Renderer.start('30fps');
    }
    function getRemainedRoute(queue) {
        var idx = queue.currentAnimIndex;
        var trans = queue.getAnimation(idx);
        var route = [];
        while (trans) {
            var point = trans._htOption.to;
            route.push(point);
            idx++;
            trans = queue.getAnimation(idx);
        }
        return route;
    }
    function runRemainedRoute(player, q) {
        var q2 = player.queue = collie.Timer.queue();
        var currentPoint = [player.disp.get('x'), player.disp.get('y')];
        var route = getRemainedRoute(q);
        route.unshift(currentPoint);
        
        var lastPoint = currentPoint;
        var point;
        var idx = 0;
        var trans;
        while ((point = route.shift())) {
            q2.transition(player.disp, player.speed * distance(lastPoint, point), {
                to: [point[0], point[1]],
                set: ['x', 'y']
            });
            lastPoint = point;
            trans = q2.getAnimation(idx);
            (function (idx) {
                trans.attach('complete', function () {
                    q2.currentAnimIndex = idx + 1;
                });
            })(idx);
            idx++;
        }
        q2.attach('complete', function () {
            console.log('queue complete');
            player.walking.stop();
        });
        q2.attach('stop', function () {
            //player.walking.stop();
        });
        return q2;
    }
    function addBoom(x, y) {
        var boom = new collie.DisplayObject({
                x: x,
                y: y,
                width: 20,
                height: 20,
            fitImage: true,
                backgroundImage: 'boom'
            });
        boom.addTo(layer);
        collie.Timer.delay(function () {
            boom.leave();
        }, opts.boomDuration);
    }
    function initSensor() {
        var sensor = new collie.Sensor({
            frequency : 1,
            //useDebug: true
        });
        _.each(ladder.players, function (p) {
            var disp = p.disp;
            sensor.add(disp, 'players');
            sensor.addListener(disp, "players", function (a, b) {
                if (a.player.num < b.player.num) {
                    var aq = a.player.queue;
                    var bq = b.player.queue;
                    var ad = a.player.disp;
                    var bd = b.player.disp;
                    
                    if (a.player.disp.get('y') == b.player.disp.get('y')) {
                        console.log('begin collision', a.player.num, b.player.num, ad.get('y'), bd.get('y'));
                        aq.stop();
                        bq.stop();
                        addBoom((ad.get('x') + bd.get('x')) / 2 + 16, (ad.get('y') + bd.get('y')) / 2);
                        runRemainedRoute(a.player, bq);
                        runRemainedRoute(b.player, aq);
                    }
                }
            }, function (a, b) {
                //console.log('end collision', arguments);
            });
        });
        sensor.start();
    }
    function initButtons() {
        var runBtn = new Button({label:'Run'}, 'Run');
        runBtn.on('click', ladder.run.bind(ladder));
        
        var refreshBtn = new Button({label:'Refresh'}, 'Refresh');
        refreshBtn.on('click', startAnim);
    }
    
    initButtons();
    initLayer();
    drawLadder(ladder);
    if (opts.allowCrash) {
        initSensor();
    }
    startAnim();

});