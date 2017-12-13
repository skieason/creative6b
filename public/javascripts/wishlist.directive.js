'use strict';

function wishListDirective($firebaseObject, $mdDialog, firebaseService, $rootScope) {
  return {
    restrict: 'E',
    link: function ($scope) {

      $scope.loaded = false;

      function setup() {
        $scope.wishList = firebaseService.getLists().$loaded().then(data => {
          $scope.uid = $rootScope.uid;
          $scope.wishList = data;
          $scope.loaded = true;
        });
        $scope.item = {
          name: '',
          description: ''
        };
        $scope.newItem = {
          name: '',
          description: ''
        };
      }

      $scope.purchase = function (personKey, itemKey, purchased) {
        firebaseService.purchase(personKey, itemKey, !purchased);
      };

      $scope.add = function (name, desc) {
        firebaseService.addItem({
          name: name,
          description: desc,
          purchased: false
        });
      };

      $scope.showConfirm = function (ev, key) {
        var confirm = $mdDialog.confirm()
          .title('Are you sure you want to delete?')
          .ariaLabel('Delete')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
        $mdDialog.show(confirm).then(function () {
          removeItem(key);
        });
      };

      function removeItem(key) {
        firebaseService.removeItem(key);
      }

      $scope.beforeEdit = function (item) {
        $scope.before = {};
        $scope.before.name = item.name;
        $scope.before.description = item.description;
      };

      $scope.cancelEdit = function (item) {
        item.name = $scope.before.name;
        item.description = $scope.before.description;
      };

      setup();
    }
  };
}

angular.module('creative6')
  .directive('wishList', ['$firebaseObject', '$mdDialog', 'firebaseService', '$rootScope', wishListDirective]);
