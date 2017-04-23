angular.module("supercoach")

.directive('navbar',function(CookieService, ScService, $location){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope, $element, $attrs, $transclude) {
			/**
			 * Check if we have the php session cookie from the supercoach site!
			 */
			if(CookieService.readCookie("phpsessionid") == null){
				$window.location.href = '/#!/getcookie';
			}

			if(CookieService.readCookie("phpsessionid").length != 32){
				$window.location.href = '/#!/getcookie';
			}


			$scope.toggleSC = function()
			{
				console.log("Toggle SC Menu");
				if($("#sc-menu").is(":visible") )
					$("#sc-menu").slideUp("fast");
				else
					$("#afl-menu").slideUp("fast", function(){
						$("#sc-menu").slideDown("fast");
					})
			}

			$scope.toggleAFL = function()
			{
				console.log("Toggle AFL Menu");
				if($("#afl-menu").is(":visible") )
					$("#afl-menu").slideUp("fast");
				else
					$("#sc-menu").slideUp("fast", function(){
						$("#afl-menu").slideDown("fast");
					});
				
			}


			$scope.getData = function(tid, refresh)
			{
				$scope.refreshing = true;
				ScService.getData(tid, refresh).then(function(data){
					console.log("Finished getting data (Nav controller)");
					$scope.leaguegames = data.leaguegames;
					$scope.aflgames = data.aflgames;
					$scope.refreshing=false;
				})
				$("#afl-menu").slideUp("fast");
				$("#sc-menu").slideUp("fast");
			}
			$scope.getData();

			$scope.gotoGame = function(game_id)
			{
				$location.path('/aflgame/'+game_id);
			}

			$scope.gotoScGame = function()
			{
				$location.path('/');
			}

		},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		 restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		 templateUrl: 'app/js/navbar/navbar.template.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),

	};
});
