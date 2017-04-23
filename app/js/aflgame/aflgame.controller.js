angular.module("supercoach")
.controller('AflGameController', function($scope, ScService, $routeParams, JsonService){
	console.log("Reached afl game controller");
	$scope.Math = window.Math;
	// current = Date.now();
	current = new Date().getTime() / 1000;

	//get the game from fixtures based on the id passed
	$scope.$watch(function(){ return ScService.getDataValue(); }, function(data) {
	    console.log("AFL GAme Controller - Detected update to SC data", data);
	    

	    if(_.isUndefined(data)) return;

	    $scope.games = data.aflgames;

	    $scope.game = findGameForId($routeParams.gameid);
	    console.log("Found game");
	    console.log($scope.game);
	    //if game is finished, then we can use the sc scores proper
	    if($scope.game.game_status=='post')
	    {
	    	addPlayersFromCompletedGame($scope.game);
	    }else if($scope.game.game_status=='now')
	    {
	    	console.log("Adding players from json");
	    	addPlayersFromJson($scope.game.id);
	    }

	  }, true);

	function findGameForId(id){
		for(var k in $scope.games)
		{
			if($scope.games[k].id == id)
				return $scope.games[k];
		}
	}


	function addPlayersFromCompletedGame(game)
	{
		$scope.players = [];
		timestamp = Date.now();
		for(var k in game.team1_players.players)
		{
			if(game.team1_players.players[k].points == 0) continue;

			name=game.team1_players.players[k].fi + ". " + game.team1_players.players[k].ln;
			player = {'team':game.team1_players.players[k].team,'player':name,'score':parseInt(game.team1_players.players[k].points),'timestamp':timestamp};
			$scope.players.push(player);
		}

		for(var k in game.team2_players.players)
		{
			if(game.team2_players.players[k].points == 0) continue;

			name=game.team2_players.players[k].fi + ". " + game.team2_players.players[k].ln;
			player = {'team':game.team2_players.players[k].team,'player':name,'score':parseInt(game.team2_players.players[k].points),'timestamp':timestamp};
			$scope.players.push(player);
		}

		console.log($scope.players);
	}

	function addPlayersFromJson(game_id)
	{
		$scope.players = [];
		JsonService.getGameJson(game_id).then(function(data){
			$scope.players = data.data;
		});
	}

	$scope.formatTimestamp = function(timestamp)
	{
		// current = Math.floor(current /1000);
		// console.log("Currnet: " + current);
		// console.log("Timestamp: " + timestamp);
		if((current - timestamp) < 60) return "";

		return Math.round((current-timestamp)/60);
	}

	//check if game is in progress, if it is, then replace the live scores on the player with data from the json
	//
	//display the players for the game in order or sc score
	//
})