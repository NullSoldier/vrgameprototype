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
            $scope.disableExtrapolation = false;
            $scope.room = 'TOP_LEFT';
            $scope.player = null;
            $scope.state = 'NOT_CONNECTED';
            $scope.enableScreenShake = false;
            $scope.lastTurnAt = null;

            function getThreatOffsetY(threat) {
                if($scope.disableExtrapolation)
                    return 0;

                var delta = (Date.now() - $scope.lastTurnAt) / $scope.turnLength;
                var offset = (threat.speed * 20) * Math.min(delta, 1.0);
                return Math.floor(offset) + 'px';
            }

            function getThreatOffsetX(threat) {
                var track = _.find($scope.tracks, {vector: threat.track});
                var progress = threat.distance / track.length;

                var delta = (Date.now() - $scope.lastTurnAt) / $scope.turnLength;
                var offset = (threat.speed / track.length) * Math.min(delta, 1.0);

                // TODO: Cache... this is slow
                var query = window.jQuery;
                var shipWidth = query('.ship-room')[0].getBoundingClientRect().width * 2;

                if($scope.disableExtrapolation)
                    offset = 0;

                return Math.max(Math.floor((progress - offset) * window.innerWidth) + shipWidth, shipWidth) + 'px';
            }

            function getThreatImageSrc(threat) {
                if(threat.name === 'Destroyer')
                    return 'images/enemy-destroyer.png'
                if(threat.name === 'Pulse Ball')
                    return 'images/enemy-pulseball.png'
                if(threat.name === 'Amobea')
                    return 'images/enemy-amobea.png'
                if(threat.name === 'Fighter')
                    return 'images/enemy-fighter.png'
                if(threat.name === 'Cryoshield Fighter')
                    return 'images/enemy-cryoshieldfighter.png'
                if(threat.name === 'Fighter')
                    return 'images/enemy-fighter.png'
                if(threat.name === 'Stealth Fighter')
                    return 'images/enemy-stealthfighter.png'
                if(threat.name === 'Meteoroid')
                    return 'images/enemy-meteroid.png'
                if(threat.name === 'Dummy')
                    return 'images/enemy-fighter.png'

                return 'images/icon-gun.png'
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

            function connectToServer() {
                var socketUrl = '';
                if(location.port)
                    socketUrl += ':' + location.port;
                return io.connect(socketUrl, {transports: ['websocket'], reconnection: true});
            }

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

            function getThreatsAt(vector, distance) {
                return _.filter($scope.threats, function(t) {
                    return t.track === vector && t.distance === distance && t.isVisible;
                });
            }

            socketOnApply('gamestate', function(data) {
                if($scope.turn != data.turn)
                    $scope.lastTurnAt = Date.now();

                $scope.turnLength = data.turnLength;
                $scope.turn = data.turn;
                $scope.state = data.state;
                $scope.players = data.players;
                $scope.rooms = data.ship ? data.ship.rooms : null;
                $scope.tracks = data.tracks;
                $scope.threats = data.threats;
                $scope.ship = data.ship;
                $scope.player = _.find(data.players, ['id', $scope.player.id]) || $scope.player;
            });

            socketOnApply('shiphit', function(data) {
                shakeScreen();
            })

            socketOnApply('alreadyinprogress', function(data) {
                $scope.state = 'REJECTED';
                $scope.reason = 'Cannot join already in progress';
                console.error('Rejected: ', $scope.reason);
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
            $scope.getThreatsAt = getThreatsAt;
            $scope.getCells = getCells;
            $scope.getThreatOffsetY = getThreatOffsetY;
            $scope.getThreatOffsetX = getThreatOffsetX;
            $scope.getPowerPercent = getPowerPercent;
            $scope.getThreatImageSrc = getThreatImageSrc;
            $scope.getRoomName = getRoomName;
            $scope.getProgressPercent = getProgressPercent;
            $scope.fireGun = fireGun;
            $scope.replenish = replenish;
        }
    }
}]);
