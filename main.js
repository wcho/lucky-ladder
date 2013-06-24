require(['/webida.js'], function(Webida) {
    var numPlayers = 9;
    var screenWidth = 320;
    var screenHeight = 480;
    var poleSpace = Math.floor(screenWidth / numPlayers);
    var barSpace = 30;
    var ladderColor = 'red';
    var ladderThick = 3;
    
    var ladderTop = 40;
    var heightPoints = Math.floor((screenHeight - ladderTop) / barSpace);
    
    console.log('heightPoints', heightPoints);
    
    function Pole(num) {
        this.num = num;
        this.height = heightPoints;
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
        var end = [this.getX(), barSpace * this.height];
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
            pos = _.random(1, heightPoints - 2);
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
    }
    Ladder.prototype.generate = function (numPlayers) {
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
    
    function drawBars(pole) {
        for(var i in pole.bars) {
            var bar = pole.bars[i];
            new collie.Polyline({
                strokeColor: ladderColor,
                strokeWidth: ladderThick
            }).addTo(layer).setPointData(bar.getLine());
        }
    }
    function drawLadder(ladder) {
        var poles = ladder.poles;
        for(var i in poles) {
            var pole = poles[i];
            var line = pole.getLine();
            console.log(pole, line);
            new collie.Polyline({
                strokeColor: ladderColor,
                strokeWidth: ladderThick
            }).addTo(layer).setPointData(line);
            drawBars(pole);
        }
    }
    function findRoute(pole) {
        var route = [];
        route.push(pole.getStart());
        var pos = 0;
        var bar;
        for(var i = 0; i < 20; i++) {
            bar = pole.getNextPosBar(pos);
            console.log('bar', pole, bar);
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
    
    var layer = new collie.Layer({
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
        bg: 'http://www.designmyprofile.com/images/graphics/backgrounds/background0172.jpg'
    });
    var bg = new collie.DisplayObject({
        x: 0,
        y: 0,
        width: screenWidth,
        height: screenHeight,
        backgroundImage: 'bg'
    }).addTo(layer);
    
    drawLadder(ladder);
    
    function Player(n) {
        this.num = n;
    }
    var players = _.map(_.range(numPlayers), function (n) {
        var disp = new collie.DisplayObject({
            x: ladder.poles[n].getStart()[0] - 32 / 2,
            y: ladder.poles[n].getStart()[1] - 32 / 2,
            width: 32,
            height: 32,
            backgroundImage: 'p' + n
        });
        var player = new Player(n);
        player.disp = disp;
        return player;
    });
    
    
    _.each(players, function (player) {
        player.disp.addTo(layer);
        player.disp.attach({
            click: function (e) {
                var currentX = player.disp.get('x');
                var currentY = player.disp.get('y');
                var queue = collie.Timer.queue();
                var route1 = findRoute(ladder.poles[player.num]);
                
                var walking = collie.Timer.cycle(player.disp, '10fps', {
                    from: 0,
                    to: 1,
                    loop: 0
                });
                for(var i in route1) {
                    var point = route1[i];
                    queue.transition(player.disp, 400, {
                        to: [point[0] - 16, point[1] - 16],
                        set: ['x', 'y']
                    });
                }
                queue.attach('complete', function () {
                    console.log('queue complete');
                    walking.stop();
                });
            }
        });
    });
    collie.Renderer.addLayer(layer);
    collie.Renderer.load(document.getElementById('container'));
    collie.Renderer.start('30fps');
});