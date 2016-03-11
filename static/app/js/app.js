/**
 * Created by mk on 11.03.16.
 */

var lentachGamesApp = angular.module('lentachGamesApp', [
    'ngRoute',
    'lentachGamesControllers',
]);

lentachGamesApp.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/', {
                redirectT: 'http://www.ya.ru',
                'templateUrl': '',
                'controller': 'userListCtrl',
            }).when('/hello', {
                redirectT: 'http://www.ya.ru'
            })
        }

]);