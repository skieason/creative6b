'use strict';

function loginDirective(firebaseService, $mdToast, $state) {
  return {
    restrict: 'E',
    link: function ($scope) {

      $scope.user = {};

      $scope.clear = function () {
        $scope.user.firstName = '';
        $scope.user.lastName = '';
        $scope.user.email = '';
        $scope.user.password = '';
        $scope.user.confirmPassword = '';
      };

      $scope.login = function () {
        toast('Logging In...');
        firebaseService.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.password)
          .then(function (success) {
            hideToast();
            $state.go('wish-list');
          })
          .catch(function (error) {
            error = firebaseService.getErrorMessage(error);
            toast(error.message);
          });
      };

      $scope.createUser = function () {
        toast('Creating User...');
        firebaseService.auth().createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
          .then(function (userData) {
            firebaseService.updateUser(userData.uid, $scope.user);
          })
          .catch(function (error) {
            error = firebaseService.getErrorMessage(error);
            toast(error.message);
          });
      };

      function toast(message) {
        $mdToast.show(
          $mdToast.simple()
            .content(message)
            .position('bottom right')
            .hideDelay(3000)
        );
      }

      function hideToast() {
        $mdToast.hide();
      }
    }
  };
}

angular.module('creative6')
  .directive('login', ['firebaseService', '$mdToast', '$state', loginDirective]);
