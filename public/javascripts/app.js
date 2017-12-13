'use strict';

var app = angular.module('creative6', [
  'firebase',
  'ngMaterial',
  'ui.router',
  'firebase'
]);

app.controller('mainController', ['$scope', 'firebaseService',
  function ($scope, firebaseService) {
    $scope.signout = function () {
      firebaseService.auth().signOut();
    };
  }
])


app.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('login', {
        url: '/',
        templateUrl: 'views/login.html'
      })

      .state('wish-list', {
        url: '/wishlist',
        templateUrl: 'views/wishlist.html'
      });

    $urlRouterProvider.otherwise('/');

  }
]);

app.run([
  '$rootScope',
  'firebaseService',
  '$state',
  function ($scope, firebaseService, $state) {

    firebaseService.auth().onAuthStateChanged(function (authData) {
      if (authData) {
        $scope.uid = authData.uid;
        firebaseService.init();
        $scope.currentUser = firebaseService.auth().currentUser;
        $state.go('wish-list')
      } else {
        $scope.uid = null;
        $state.go('login');
      }
    });

  }]);

app.service('firebaseService', ['$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', function ($rootScope, $firebaseAuth, $firebaseArray, $firebaseObject) {
  var Ref = firebase.database().ref();
  var items = [];
  return {
    init: function () {
      this.getItems();
    },
    auth: function () {
      return firebase.auth();
    },
    getUser: function (uid) {
      return Ref.child(uid);
    },
    updateUser: function (uid, userObj) {
      var obj = {
        id: uid,
        email: userObj.email,
        firstName: userObj.firstName,
        lastName: userObj.lastName
      };
      var updates = {};
      updates['/users/' + uid + '/'] = obj;
      firebase.database().ref().update(updates);
      this.auth().currentUser.updateProfile({
        displayName: obj.firstName + ' ' + obj.lastName
      })
    },
    getLists: function () {
      return $firebaseArray(Ref.child('users'));
    },
    update: function (items) {
      firebase.database().ref('/users/' + $rootScope.uid + '/').update({
        items: items
      });
    },
    getItems: function () {
      var ref = firebase.database().ref('/users/' + $rootScope.uid + '/items/');
      items = $firebaseArray(ref);
    },
    addItem: function (item) {
      items.$add(item);
    },
    removeItem: function (key) {
      firebase.database().ref('/users/' + $rootScope.uid + '/items/').child(key).remove();
    },
    items: function () {
      return items;
    },
    purchase: function (personKey, itemKey, purchased) {
      firebase.database().ref('/users/' + personKey + '/items/').child(itemKey).update({
        purchased: purchased
      });
    },
    getErrorMessage: function (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          error.message = 'The specified user account email is invalid.';
          return error;
        case 'auth/wrong-password':
          error.message = 'The specified user account password is incorrect.';
          return error;
        case 'auth/user-not-found':
          error.message = 'The specified user account does not exist.';
          return error;
        case 'auth/email-already-in-use':
          error.message = 'The specified email is already in use.';
          return error;
        default:
          return error;
      }
    }
  };
}]);
