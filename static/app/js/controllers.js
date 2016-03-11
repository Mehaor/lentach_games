/**
 * Created by mk on 11.03.16.
 */

var queryPrefix = 'http://localhost:8000';

var lentachGamesControllers = angular.module('lentachGamesApp', []);

lentachGamesControllers.controller('userListCtrl', ['$scope', '$http', function($scope, $http) {
            $http.get(queryPrefix + '/api/users').then(function(response) {
                $scope.users = response.data; }
            );
}]);





