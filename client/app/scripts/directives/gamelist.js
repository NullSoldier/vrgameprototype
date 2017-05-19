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

            $scope.debug = true;
            $scope.room = 'TOP_LEFT';
            $scope.player = null;
            $scope.state = 'NOT_CONNECTED';
            $scope.enableScreenShake = false;
            $scope.lastTurnAt = null;

            function getThreatOffsetY(threat) {
                var delta = (Date.now() - $scope.lastTurnAt) / $scope.turnLength;
                var offset = (threat.speed * 20) * Math.min(delta, 1.0);
                return Math.floor(offset) + 'px';
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

            function startGame() {
                console.log('starting')
                socket.emit('start', {});
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
                    $timeout(function() {$scope.startGame()});
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
            $scope.getPowerPercent = getPowerPercent;
            $scope.getRoomName = getRoomName;
            $scope.getProgressPercent = getProgressPercent;
            $scope.fireGun = fireGun;
            $scope.replenish = replenish;
        }
    }
}]);
