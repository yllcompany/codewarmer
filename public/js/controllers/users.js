angular.module('mean.users').controller('UsersController', function($scope, $routeParams, $location, $rootScope, $http, Global, Auth, Loader, Page) {
  $scope.global = Global;
	$scope.zombie = Page.isZombie();
	$scope.user = {};
	$scope.vcRecaptcha = {};

	$scope.signIn = function() {
		Auth.login($scope.user, function() {
			if($location.path() === '/signin')
				$location.path('/');
		},
		function(data,status,headers) {
			if(status === 400){
				$scope.message = data.message;
				$scope.showMessage = true;
			}
		});
	};

	$scope.signUp = function() {
		$scope.user.recaptcha = $scope.vcRecaptcha.service.data();
		Auth.create($scope.user, function() {
			$location.path('/');
		},
		function(data,status,headers) {
			if(status === 400){
				$scope.errors = data.errors;
				$scope.showErrors = true;
				//Reload recaptcha
				$scope.vcRecaptcha.service.reload();
			}
		});
	};
});

angular.module('mean.users').controller('RecaptchaCtrl', function($scope, vcRecaptchaService) {
	//make vcRecaptchaService available for parent scope
	$scope.$parent.vcRecaptcha.service = vcRecaptchaService;
});
