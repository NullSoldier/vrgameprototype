'use strict';

window.$ = window.jQuery = require('jquery');

require('moment');
require('angular');
require('angular-cookies');
require('angular-messages');
require('angular-messages');
require('angular-resource');
require('angular-route');
require('angular-sanitize');
require('angular-bootstrap-switch')
require('slick-carousel');
require('angular-slick-carousel')
require('bootstrap')

angular
    .module('vrApp', [
      'ngCookies',
      'ngMessages',
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'vrApp/templates',
      'frapontillo.bootstrap-switch',
      'slickCarousel',
    ])
    .config(function ($routeProvider, $httpProvider, $locationProvider) {
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });

        $routeProvider
            .when('/', {
                name: 'gameslist',
                template: '<game-list></game-list>',
            })
            .when('/:gameId', {
                name: 'game',
                template: (params) => `<game game-id="${params.gameId}"></game>`,
            })
            .when('/', {redirectTo: '/play'})
            .otherwise({templateUrl: '404.html'});
    });

require('./gamelist/gamelist.js');
require('./game/game.js');
