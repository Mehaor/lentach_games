;(function(){
    var lentachGamesApp = angular.module('lentachGamesApp', [
        'ngRoute',
        'lentachGamesControllers',
    ]);
    lentachGamesApp.config(['$routeProvider',
            function($routeProvider) {
                $routeProvider.when('/', {
                    templateUrl: 'templates/home.html',
                    controller: 'indexCtrl'
                }).when('/users', {
                    templateUrl: 'templates/user_list.html',
                    controller: 'userListCtrl'
                }).when('/login', {
                    templateUrl: 'templates/login.html',
                    controller: 'loginCtrl'
                }).otherwise({
                    redirectTo: '/'
                });
            }
    ]);
})();