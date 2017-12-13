'use strict';

function shoppingListDirective($firebaseObject, $mdDialog, firebaseService, $rootScope) {
  return {
    restrict: 'EA',
    link: function ($scope) {

      $scope.loaded = false;

      function setup() {
        $scope.shoppingList = firebaseService.getLists().$loaded().then(data => {
          $scope.uid = $rootScope.uid;
          $scope.shoppingList = data;
          $scope.loaded = true;
        });
        $scope.item = {
          name: '',
          description: '',
          price: ''
        };
        $scope.newItem = {
          name: '',
          description: '',
          price: ''
        };
      }

      $scope.purchase = function (personKey, itemKey, purchased) {
        firebaseService.purchase(personKey, itemKey, !purchased);
      };

      $scope.add = function (name, desc, prc) {
        firebaseService.addItem({
          name: name,
          description: desc,
          purchased: false,
          price: prc
        });
      };

      $scope.listPrice = function () {
        var price = 0;
        for (var key in $scope.shoppingList) {
          if ($scope.shoppingList[key].id === $scope.uid) {
            for (var key2 in $scope.shoppingList[key].items) {
              price += parseInt($scope.shoppingList[key].items[key2].price);
            }
          }
        }
        return price;
      };

      $scope.listCartPrice = function () {
        var price = 0;
        for (var key in $scope.shoppingList) {
          if ($scope.shoppingList[key].id === $scope.uid) {
            for (var key2 in $scope.shoppingList[key].items) {
              if ($scope.shoppingList[key].items[key2].purchased) {
                price += parseInt($scope.shoppingList[key].items[key2].price);
              }
            }
          }
        }
        return price;
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

      $scope.showPurchaseConfirm = function (ev, shoppingList) {
        var confirm = $mdDialog.confirm()
          .title('Are you sure you want to make your purchase? This will remove all items from list that are in the cart')
          .ariaLabel('Purchase')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
        $mdDialog.show(confirm).then(function () {
          for (var key in shoppingList) {
            if (shoppingList[key].purchased === true) {
              removeItem(key);
            }
          }
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
  .directive('shoppingList', ['$firebaseObject', '$mdDialog', 'firebaseService', '$rootScope', shoppingListDirective]);
