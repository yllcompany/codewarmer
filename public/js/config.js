//Setting up route
angular.module('mean').config(function($routeProvider, $locationProvider, $httpProvider) {
  $routeProvider.
    when('/tags/:tags', {
      templateUrl: '/views/articles/list.html',
    }).
    when('/posts/create', {
      templateUrl: '/views/articles/edit.html',
			access: 'admin',
			resolve: {
				'load': ['$q','$rootScope', 'Loader', loadCkeditor]
			}
    }).
    when('/posts/:slug/edit', {
      templateUrl: '/views/articles/edit.html',
			access: 'admin'
    }).
    when('/posts/:slug', {
      templateUrl: '/views/articles/view.html',
    }).
		when('/search/:search', {
			templateUrl: '/views/articles/list.html',
		}).
		when('/signin', {
      templateUrl: '/views/users/signin.html'
    }).
		when('/signup', {
      templateUrl: '/views/users/signup.html'
    }).
    when('/', {
      templateUrl: '/views/articles/list.html'
    }).
		when('/admin', {
      templateUrl: '/views/admin/adm_index.html',
			access: 'admin'
    }).
    otherwise({
      redirectTo: '/'
    });

	$httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
		return {
			'responseError': function(response) {
				if(response.status === 401 || response.status === 403){
					$location.path('/signin');
					return $q.reject(response);
				}
				else
					return $q.reject(response);
			}
		};
	}]);


	function loadCkeditor($q,$rootScope, Loader){
		var deferred = $q.defer();
		Loader.load('ckeditor', function() {
			$rootScope.$apply(function() {
				deferred.resolve();
			});
		});
		return deferred.promise;
	}
}).run(function($rootScope, $location, $http, Auth) {
	//Check access parameter for path
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
		$rootScope.error = null;
		if(next.access && !Auth.checkAccess(next.access))
			return Auth.isLoggedIn() ? $location.path('/') : $location.path('/signin');
	});
});

//Setting HTML5 Location Mode
angular.module('mean').config(function($locationProvider) {
  $locationProvider.hashPrefix("!");
	$locationProvider.html5Mode(true);
});

angular.module('mean').config(function($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
	// angular.module.controller = $controllerProvider;
	// angular.module.directive = $compileProvider;
	// angular.module.filter = $filterProvider;
	// angular.module.provide = $provide;
  window.meanProviders = {
		'$routeProvider':	$routeProvider, 
		'$controllerProvider': $controllerProvider, 
		'$compileProvider': $compileProvider, 
		'$filterProvider': $filterProvider, 
		'$provide': $provide
	};
});
