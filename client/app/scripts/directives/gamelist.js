var _  = require('lodash');
var io = require('socket.io-client');

var app = angular.module('vrApp');

app.directive('gameList', ['$timeout', 'Api', function ($timeout, Api) {
    return {
        restrict: 'E',
        templateUrl: 'views/gamelist.html',
        scope: {},
        bindToController: {},
        controllerAs: 'gameListCtrl',

        controller: function($scope) {
            var self = this;
            var socket = null;

            $scope.debug = false;
            $scope.room = 'TOP_LEFT';
            $scope.player = null;
            $scope.state = 'NOT_CONNECTED';
            $scope.enableScreenShake = false;

            var disableExtrapolation = false;
            var selectedFeature = null;
            var lastTickAt = null;
            var tickLength = null;

            function lerp(min, max, amount) {
                return min + ((max - min) * amount);
            }

            function getThreatOffsetY(threat) {
                var distance = threat.distance;

                if(!disableExtrapolation)
                    distance -= threat.speed * ((Date.now() - lastTickAt) / tickLength);

                const THREAT_DETECTOR_CELL_HEIGHT = 17;
                return distance * THREAT_DETECTOR_CELL_HEIGHT + 'px';
            }

            function getThreatOffsetX(threat) {
                var track = _.find($scope.tracks, {vector: threat.track});
                var distance = threat.distance;

                if(!disableExtrapolation)
                    distance -= threat.speed * ((Date.now() - lastTickAt) / tickLength);

                let progress = Math.max(distance / track.length, 0);

                const SHIP_WIDTH = window.jQuery('.ship-room')[0].getBoundingClientRect().width * 2;
                return lerp(SHIP_WIDTH, window.innerWidth * 3, progress);
            }

            function getThreatImageSrc(threat) {
                return {
                    'Destroyer'         : 'images/enemy-destroyer.png',
                    'Pulse Ball'        : 'images/enemy-pulseball.png',
                    'Amobea'            : 'images/enemy-amobea.png',
                    'Fighter'           : 'images/enemy-fighter.png',
                    'Cryoshield Fighter': 'images/enemy-cryoshieldfighter.png',
                    'Fighter'           : 'images/enemy-fighter.png',
                    'Stealth Fighter'   : 'images/enemy-stealthfighter.png',
                    'Meteoroid'         : 'images/enemy-meteroid.png',
                    'Dummy'             : 'images/enemy-fighter.png',
                }[threat.name] || 'images/icon-gun.png'
            }

            function getRoomName(room) {
                if(room === 'TOP_LEFT') return 'LEFT FLANK';
                if(room === 'TOP_CENTER') return 'BRIDGE';
                if(room === 'TOP_RIGHT') return 'RIGHT FLANK';
                if(room === 'BOTTOM_LEFT') return 'LEFT FUEL ROOM';
                if(room === 'BOTTOM_CENTER') return 'REACTOR';
                if(room === 'BOTTOM_RIGHT') return 'RIGHT FUEL ROOM';
                throw 'Room not supported' + room
            }

            function shakeScreen() {
                if($scope.debug)
                    return;

                $scope.enableScreenShake = true;
                $timeout(function() {$scope.enableScreenShake = false}, 200);

                if(window.navigator.vibrate)
                    window.navigator.vibrate([200, 100, 200]);
            }

            function onGameStart() {
                selectedFeature = {};
            }

            function connectToServer() {
                var socketUrl = '';
                if(location.port)
                    socketUrl += ':' + location.port;
                return io.connect(socketUrl, {transports: ['websocket'], reconnection: true});
            }

            $scope.state = 'CONNECTING';
            socket = connectToServer();

            function socketOnApply(event, fn) {
                socket.on(event, function(data) {
                    $timeout(fn.bind(this, data));
                });
            }

            function startGame(missionName) {
                console.log(`starting mission: ${missionName}`)
                socket.emit('start', {mission: missionName});
            }

            function movePlayer(room) {
                socket.emit('action', {name: 'move', room: room});
            }

            function doAction(name, data) {
                data = data || {};
                socket.emit('action', _.extend({name: name, room: $scope.player.room}, data));
            }

            function replenish() {
                doAction('replenish');
            }

            function fireGun() {
                doAction('gun');
            }

            function getCells(track) {
                return new Array(track.length);
            }

            function getPowerPercent(room) {
                const percent = $scope.ship.rooms[room].power / $scope.ship.rooms[room].maxPower;
                return percent * 100 + '%';
            }

            function getProgressPercent() {
                return (turn / 10) * 100 + '%';
            }

            function getThreatsOn(vector) {
                return _.filter($scope.threats, function(t) {return t.track === vector && t.isVisible});
            }

            function slickOnChange(event, slick, currentSlide, nextSlide) {
                selectedFeature[slick.options.room] = currentSlide;
            }

            function slickOnInit (event, slick) {
                if(selectedFeature[slick.options.room])
                    slick.slickGoTo(selectedFeature[slick.options.room], true, true);
            }

            function slickConfig(room) {
                return {
                    infinite: false,
                    arrows: false,
                    dots: false,
                    autoplay: false,
                    room: room,
                    event: {afterChange: slickOnChange, init: slickOnInit}
                };
            }

            socketOnApply('gamestate', function(data) {
                var lastState = $scope.state;

                lastTickAt = Date.now();
                tickLength = data.tickLength;

                $scope.turn = data.turn;
                $scope.state = data.state;
                $scope.players = data.players;
                $scope.rooms = data.ship ? data.ship.rooms : null;
                $scope.tracks = data.tracks;
                $scope.threats = data.threats;
                $scope.ship = data.ship;
                $scope.player = _.find(data.players, ['id', $scope.player.id]) || $scope.player;

                if(data.state === 'PLAYING' && lastState != 'PLAYING')
                    onGameStart();
            });

            socketOnApply('shiphit', function(data) {
                shakeScreen();
            })

            socketOnApply('alreadyinprogress', function(data) {
                $scope.reason = 'Cannot join a game that is already in progress';
                socket.disconnect();
            });

            socketOnApply('joined', function(data) {
                $scope.player = data;
                console.log('Joined', data);

                if($scope.debug)
                    $timeout(function() {$scope.startGame('tutorial')});
            });

            socketOnApply('playerjoined', function(player) {
                if(player.id !== $scope.player.id)
                    console.log('Player joined: ', player.id);
            });

            socketOnApply('playerleft', function(player) {
                console.log('Player left: ', player.id);
            });

            socketOnApply('disconnect', function() {
                $scope.state = 'NOT_CONNECTED';
            });

            socketOnApply('connect', function() {
                $scope.state = 'CONNECTED';
                socket.emit('join', {});
            });

            $scope.startGame = startGame;
            $scope.movePlayer = movePlayer;
            $scope.getThreatsOn = getThreatsOn;
            $scope.getCells = getCells;
            $scope.getThreatOffsetY = getThreatOffsetY;
            $scope.getThreatOffsetX = getThreatOffsetX;
            $scope.getPowerPercent = getPowerPercent;
            $scope.getThreatImageSrc = getThreatImageSrc;
            $scope.getRoomName = getRoomName;
            $scope.getProgressPercent = getProgressPercent;
            $scope.fireGun = fireGun;
            $scope.replenish = replenish;
            $scope.JSON = JSON;

            $scope.slickConfigs = {
                TOP_LEFT     : slickConfig('TOP_LEFT'),
                TOP_CENTER   : slickConfig('TOP_CENTER'),
                TOP_RIGHT    : slickConfig('TOP_RIGHT'),
                BOTTOM_LEFT  : slickConfig('BOTTOM_LEFT'),
                BOTTOM_CENTER: slickConfig('BOTTOM_CENTER'),
                BOTTOM_RIGHT : slickConfig('BOTTOM_RIGHT'),
            }
        }
    }
}]);
