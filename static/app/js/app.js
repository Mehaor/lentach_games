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
                templateUrl: 'templates/home.html',
                controller: 'indexCtrl',
            }).when('/users', {
                templateUrl: 'templates/user_list.html',
                controller: 'userListCtrl',
            })
        }
]);