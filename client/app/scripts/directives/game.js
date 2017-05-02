var app = angular.module('vrApp');

app.directive('game', ['$routeParams', 'Api', function ($routeParams, Api) {
    return {
        restrict: 'E',
        templateUrl: 'views/game.html',
        controllerAs: 'gameCtrl',
        scope: {},
        bindToController: {},

        controller: function($scope) {
            var self = this;
        }
    }
}]);
