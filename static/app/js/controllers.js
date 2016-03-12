/**
 * Created by mk on 11.03.16.
 */

var queryPrefix = 'http://localhost:8000';

var lentachGamesControllers = angular.module('lentachGamesControllers', []);


lentachGamesControllers.controller('indexCtrl', ['$scope', '$http', function($scope, $http) {
    $http.post(queryPrefix + '/api/login/').then(function(response) {
        console.log(response.data);
    });
}]);

lentachGamesControllers.controller('loginCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.msg = 'HELLO';
}]);

lentachGamesControllers.controller('userListCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get(queryPrefix + '/api/users').then(function(response) {
        $scope.users = response.data; }
    );
}]);






