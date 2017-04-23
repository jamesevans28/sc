angular.module("supercoach")
.service('JsonService', function($http){
	var self = this;
	self.updateLiveData = updateLiveData; 
	self.writing = false;

	self.writeToGameJson = function(data)
	 {

	
	 	if(self.writing) return;

	 	data = angular.toJson(data);
	 	

	 	self.writing = true;
	 	$http({
	 		method:"POST",
	 		url: "/json.php",
	 		data: data
	 	})
	 	.then(function(){
	 		self.writing=false;
	 	});
	 }

	 self.getGameJson = function(game_id)
	 {
	 	return $http({
	 		method:"GET",
	 		url: "/json.php?game_id="+game_id
	 	})
	 }

	 //update live data
	 function updateLiveData(team, opponent, aflgames)
	 {
	 	console.log("Updating live data");
	 	var data = [];
	 	for(var k in team.player_list.field.players)
	 	{
	 		 data.push(checkForLiveUpdate(team.player_list.field.players[k], aflgames));
	 	}
	 	for(var k in team.player_list.bench.players)
	 	{
	 		data.push(checkForLiveUpdate(team.player_list.bench.players[k], aflgames));
	 	}
	 	for(var k in opponent.player_list.field.players)
	 	{
	 		data.push(checkForLiveUpdate(opponent.player_list.field.players[k], aflgames));
	 	}
	 	for(var k in opponent.player_list.bench.players)
	 	{
	 		data.push(checkForLiveUpdate(opponent.player_list.bench.players[k], aflgames));
	 	}

	 	var i = data.length
		while (i--) {
		    if(typeof(data[i]) == 'undefined'){
	 			data.splice(i,1);
	 		} 
		}


	 	self.writeToGameJson(data);
	 }

	 function checkForLiveUpdate(player, aflgames)
	 {
	 	if(player.match_status=='In Play')
 		{
 			response = {};
 			//get game id
 			for(var i in aflgames)
 			{
 				if(aflgames[i].team1_abbrev == player.team || aflgames[i].team2_abbrev == player.team){
 					response.game_id = aflgames[i].id;
 					break;
 				}
 			}
 			
 			response.player = player.fi + ". " + player.ln;
 			response.score = player.livepts;
 			response.team = player.team;
 			//console.log(response);
 			return response;
 			// self.writeToGameJson(game_id, name, score, team);
 		}
	 }

});