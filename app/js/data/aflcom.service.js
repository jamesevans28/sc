angular.module("supercoach")
.service('AflcomService', function(ScService, $http){
	
	var self = this;
	self.games = ScService.data.aflgames;
	self.teamData;
	var userPromise;

	self.getAflTeamData = function()
	{
		 if (userPromise) {
            return userPromise;
        }

    	userPromise = $http({
		  method: 'GET',
		  url: 'teams.php'
		}).then(function successCallback(response) {
		    self.teamData = response.data;
		    console.log("got teams.php back:");
		    console.log(self.teamData);
		    return response.data;
		  }, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });


        return userPromise;
	}
	// 



	self.getCurrentQuarter = function(player_team)
    {
    	for (var k in self.games)
    	{
    		if(self.games[k].team1_abbrev == player_team || self.games[k].team2_abbrev == player_team) {
    			
    			if(self.games[k].period_status == 'Half time') return 'HT';
    			if(self.games[k].period_status == 'Quarter time') return 'QT';
    			if(self.games[k].period_status == 'Three-quarter time') return '3QT';
    			else
    				return _.replace(self.games[k].period_status," - ","\n") 
    		}
    	}
    }	
})