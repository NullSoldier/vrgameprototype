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

            $scope.room = 'TOP_LEFT';
            $scope.player = null;
            $scope.state = 'NOT_CONNECTED';

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

            socketOnApply('gamestate', function(data) {
                console.log(data.state);
                $scope.state = data.state;
                $scope.players = data.players;
                $scope.rooms = data.rooms;
            });

            socketOnApply('alreadyinprogress', function(data) {
                console.error('Cannot join already in progress');
            });

            socketOnApply('joined', function(data) {
                $scope.player = data;
                console.log('Joined');
            });

            socketOnApply('playerjoined', function(player) {
                if(player.id !== $scope.player.id)
                    console.log('Player joined: ', player.id);
            });

            $scope.startGame = startGame;
            $scope.state = 'CONNECTED';
            socket.emit('join', {});
        }
    }
}]);
