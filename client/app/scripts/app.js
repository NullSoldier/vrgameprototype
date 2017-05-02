'use strict';

require('jquery');
require('moment');
require('angular');
require('angular-cookies');
require('angular-messages');
require('angular-messages');
require('angular-resource');
require('angular-route');
require('angular-sanitize');
require('angucomplete-alt');
require('angular-elastic');
require('angular-bootstrap-switch')

angular
    .module('vrApp', [
      'ngCookies',
      'ngMessages',
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'angucomplete-alt',
      'monospaced.elastic',
      'frapontillo.bootstrap-switch'
    ])
    .config(function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/games/', {
                name: 'gameslist',
                template: '<game-list></game-list>',
            })
            .when('/games/:gameId/', {
                name: 'game',
                template: '<game></game>',
            })
            .when('/', {redirectTo: '/games/'})
            .otherwise({templateUrl: '/views/404.html'});
    });

require('./directives/gamelist.js');
require('./directives/game.js');
require('./services/api.js');
