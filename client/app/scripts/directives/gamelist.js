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
                return io.connect(socketUrl, {transports: ['websocket']});
            }

            socket = connectToServer();

            function socketOnApply(event, fn) {
                socket.on(event, function(data) {
                    $timeout(function() { fn(data) });
                });
            }

            function startGame() {
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
                return (1 - percent) * 100 + '%';
            }

            function getThreatsAt(vector, distance) {
                return _.filter($scope.threats, function(t) {
                    return t.track === vector && t.distance === distance && t.isVisible;
                });
            }

            socketOnApply('gamestate', function(data) {
                $scope.turn = data.turn;
                $scope.state = data.state;
                $scope.players = data.players;
                $scope.rooms = data.rooms;
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

            socket.on('playerleft', function(player) {
                console.log('Player left: ', player.id);
            });

            $scope.startGame = startGame;
            $scope.movePlayer = movePlayer;
            $scope.getThreatsAt = getThreatsAt;
            $scope.getCells = getCells;
            $scope.getPowerPercent = getPowerPercent;
            $scope.fireGun = fireGun;
            $scope.replenish = replenish;

            $scope.state = 'CONNECTED';
            socket.emit('join', {});
        }
    }
}]);
