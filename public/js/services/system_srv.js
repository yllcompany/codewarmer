angular.module('mean.system').factory('Page', function() {
  var title = '',	description = '', keywords = '';
	return {
		getTitle: function() {
			return title || 'CodeWarmer - blog about software development and egeneering';
		},
		setTitle: function(newTitle) {
			title = newTitle + '| CodeWarmer';
		},
		getDescription: function() {
			return description || 'This blog is mainly about the web programming and related topics with many examples';
		},
		setDescription: function(newDescription) {
			description = newDescription;
		},
		getKeywords: function() {
			return keywords || 'node.js, express, mongoose, mongodb, angular, javascript';
		},
		setKeywords: function(newKeywords) {
			keywords = newKeywords;
		},
		setDefault: function() {
			title = description = keywords = '';
		}
	};
});

angular.module('mean.system').factory('Loader', function($window, $rootScope, $interval) {
	//use $script.js library that loaded to window.$script
	//$window.meanFiles - contains project files
	//$window.meanProviders - angular providers for current app
	var loading = {}, callbacks = {};
  return {
		/**
		 * @param lib - string
		 * @param config - object (optional)
		 * @param callback - function
		 */
		load: function(lib, config, callback) {
			callbacks[lib] = callbacks[lib] || [];
			loading[lib] = loading[lib] || {status: 0};

			if(config && config.sync){
				var files = $window.meanFiles[lib];
				syncLoader(files);

				function syncLoader(files){
					//console.log(files);
					var file = files.shift();
					//console.log(files.length);
					if(files.length == 0){
						//console.log('adds callback');
						callbacks[lib] = [];
						callbacks[lib].push(libModuleLoader(lib));
						callbacks[lib].push(callback);
					}
					else{
						callbacks[lib].push(function() {
							return syncLoader(files);
						});
					}
					//console.log('runLoad');
					loadLib(file);
				}
				return;
			}

			callback = typeof config == 'function' ? config : callback;
			//Check if library already in process or processed
			if(loading[lib].status == 1)
			 	return callback();
			else if(callbacks[lib].length > 0){
				callbacks[lib].push(callback);
			}
			else{
				callbacks[lib].push(libModuleLoader(lib));
				callbacks[lib].push(callback);
				//run library loading
				loadLib($window.meanFiles[lib]);
			}

			//loads library files with $script.js library
			function loadLib(files){
				$script(files, function() {
					//apply config stuff or just execute callbacks
					if(typeof config == 'object' && config.ensure && !$window[config.ensure]){
						var stop = $interval(function() {
							if($window[config.ensure]){
								$interval.cancel(stop);
								executeCallbacks();
							}
						}, 100);
					}
					else{
						executeCallbacks();
					}

					//Executes all callbacks and change loaded status to 1
					function executeCallbacks(){
						callbacks[lib].forEach(function(cb) {
							cb();
						});
						loading[lib].status = 1;
						return;
					}
				});
			}

			function libModuleLoader(lib) {
				var moduleName = null;
				switch(lib){
					case 'ckeditor': moduleName = 'ngCkeditor'; break;
					case 'recaptcha': moduleName = 'vcRecaptcha'; break;
				}
				if(!moduleName) return function() {}
				return function() {
					var queue = angular.module(moduleName)._invokeQueue;
					queue.forEach(function(val) {
						// val[0] - provider name. val[1] - provider method, 
						// val[2][0] - name of entity, val[2][1] - services to inject and function
						$window.meanProviders[val[0]][val[1]](val[2][0],val[2][1]);
					});
				}
			}

		}
	};
});

// Loader.includeController('ckeditor', function() {
// 	$scope.$apply(function() {
// 		//$scope.showEditor = true;			
// 		$compile($element)($scope);
// 	});
// });
