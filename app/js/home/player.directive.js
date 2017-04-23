angular.module("supercoach")
.directive('player', function(AflcomService){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		// restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		 templateUrl: 'app/js/home/player.template.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			// console.log($scope.player);
			// console.log(iAttrs.ha);

			if(typeof(iAttrs.ha) == 'undefined') 
				$scope.ha = 'home'
			else
				$scope.ha = iAttrs.ha;

			$scope.getCurrentQuarter = function(player){
				return AflcomService.getCurrentQuarter(player);
			}

			/**
			 * REturn the class that we need to apply for if the player is playing or not
			 */
			$scope.getPlayingClass = function(status, ha)
			{
				state="";
				if(status == "now") state="playing";
				else if(status == "post") state="finished";
				else state = "not-played";

				if(ha == 'away') state = state + "-r";

				return state;
			}

			/**
			 * REturn the status of the player. 
			 * Eg, playing, injured, emergency
			 */
			 
			 AflcomService.getAflTeamData().then(function(data){
			 	//console.log("Got data back");
			 	self.teamData = data;
			 });

			 $scope.getPlayerSelection = function(fn,ln)
			 {
			 	//console.log(self.teamData);
			 	name = fn + " " + ln;
			 	if(name == "Patrick Ryder") name = "Paddy Ryder";


			 	//console.log($scope.teamData);
			 	if(typeof self.teamData == 'undefined'){
			 		return "loading";
			 	} 
			 	// console.log("Player: " + name);
			 	// 
			 	// 
			 	for(var k in self.teamData)
			 	{
			 		//loop through all team data
			 		if(!_.isUndefined(self.teamData[k].Team)){
			 			for(var i in self.teamData[k].Team)
				 		{
				 			if(self.teamData[k].Team[i] == name){
				 				// console.log(" is playing");
				 				return "playing";
				 			} 
				 		}
			 		}
			 		
			 		//loop through all injuries
			 		for(var i in self.teamData[k].Injuries)
			 		{
			 			if(self.teamData[k].Injuries[i].player == name){
			 				// console.log(" is injured");
			 				return "inj";
			 			} 
			 		}

			 		//loop through emergencies
			 		if(!_.isUndefined(self.teamData[k].Emergency)){
			 			for(var i in self.teamData[k].Emergency)
				 		{
				 			if(self.teamData[k].Team[i] == name){
				 				// console.log(" is emergency");
				 				return "emerg";
				 			} 
				 		}
			 		}
			 		
			 	}
			 	return "none";
			 }
		}
	};
});
