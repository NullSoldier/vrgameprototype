var app = angular.module('vrApp');

app.directive('gameList', ['$routeParams', function ($routeParams) {
    return {
        restrict: 'E',
        templateUrl: 'gamelist/gamelist.html',
        controllerAs: 'gameListCtrl',
        scope: {},
        bindToController: {},

        controller: function($scope) {
            var self = this;
        }
    }
}]);
