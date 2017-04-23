// angular.module("supercoach")
// .run(function ($rootScope, $state, $window, $location) {

//   $window.ga('create', 'UA-96202267-1', 'auto');

//    $rootScope.$on('$routeChangeSuccess', function (event) {
//       $window.ga('send', 'pageview', $location.path());
//       console.log("Route Change Success");
//    });

// });

angular.module("supercoach",['ngRoute','templates'])
.config(function($sceDelegateProvider) {
 $sceDelegateProvider.resourceUrlWhitelist([
   // Allow same origin resource loads.
   'self',
   // Allow loading from our assets domain.  Notice the difference between * and **.
   'http://supercoach.heraldsun.com.au/**']);
 })

.run(function ($rootScope, $window, $location) {

  $window.ga('create', 'UA-96202267-1', 'auto');

   $rootScope.$on('$routeChangeSuccess', function (event) {
      $window.ga('send', 'pageview', $location.path());
   });

});

/**
* Empty module to hold all template files
* Template files are put into this module via a gulp command
*/
angular.module('templates', []);
angular.module("supercoach")
.config(function($routeProvider) {
		$routeProvider

			// route for the home page
			.when('/', {
				templateUrl : 'app/js/home/home.template.html',
				controller  : 'HomeController as ctrl'
			})
			.when('/aflgame/:gameid', {
				templateUrl : 'app/js/aflgame/aflgame.template.html',
				controller  : 'AflGameController as ctrl'
			})
			.when('/getcookie', {
				templateUrl : 'app/js/cookie/cookie.template.html',
				controller  : 'CookieController as ctrl'
			});

			// // route for the about page
			// .when('/about', {
			// 	templateUrl : 'pages/about.html',
			// 	controller  : 'aboutController'
			// })

			// // route for the contact page
			// .when('/contact', {
			// 	templateUrl : 'pages/contact.html',
			// 	controller  : 'contactController'
			// });
	})
.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);
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
angular.module("supercoach")

.controller('CookieController', function($scope, $window){
	console.log("This is the home controller");
	var self = this;


	$scope.save = function()
	{
		days=999;
		name="phpsessionid";
		value=$scope.phpsessionid;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";               

        document.cookie = name + "=" + value + expires + "; path=/";
        
        $window.location.href = '/';
	}
});
angular.module("supercoach")
.service('CookieService', function(){
	 /**
	  * Cookie functions
	  * 
	  */
	 var self = this;
	 self.createCookie = createCookie;
	 self.readCookie = readCookie;


	 function createCookie(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            }
            else var expires = "";               

            document.cookie = name + "=" + value + expires + "; path=/";
        }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }


})
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

angular.module("supercoach")
.service('ScService', function($timeout, $window, CookieService, $q, JsonService){

	var self = this;

	self.getData = getData;
	self.getDataValue = getDataValue;
	var dataPromise;
	

	 function getDataValue(){
	 	return self.data;
	 }


	 /**
	  * Get the game data from the SC website
	  */
	 function getData(tid, refresh){
	 	//$scope.refreshing=true;
	 	//$scope.data = {};
	 	console.log("Attempting to get data for tid: " + tid + ". Refresh from api: " + refresh);
	 	$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	    console.log(options);
	    if (options.url.match(/^http?:/)) {
	        // options.headers['X-Proxy-URL'] = options.url;
	         jqXHR.setRequestHeader('X-Proxy-URL', options.url);
	        // jqXHR.setRequestHeader('phpsesh', "d8491ffd050fa19e2690cf57d05ca6fb");
	         jqXHR.setRequestHeader('phpsesh', CookieService.readCookie("phpsessionid"));
	       
	        options.url = '/proxy.php';
	    }
		});


	 	

	 	if(self.deferred && refresh!=true){
	 		return self.deferred.promise;
	 	}
	 	
	 	self.deferred = $q.defer();
	 	$.ajax({
	        url: "http://supercoach.heraldsun.com.au/afl/draft/service/match_centre/update/?",
	        data:{tid:tid,csurl:"http://supercoach.heraldsun.com.au/afl/draft/service/match_centre/update/"}
	    })
	    .done  (function(data, textStatus, jqXHR)        
	    { 
	    	console.log(data);

	    	if(typeof data.team == 'undefined') {
	    		alert("Code is invalid. Please try re enter");
	    		$window.location.href = '/#!/getcookie';
	    	}
	    	$timeout(function () {
	    		//$scope.data = data;
		        // self.data.myplayers =  data.team.player_list.field.players
		        // self.data.mybench =  data.team.player_list.bench.players
		        self.data = {};
		        self.data.updated_at = new Date();
		        self.data.leaguegames = data.schedule.games;
		        self.data.aflgames = data.fixture.games;

		        self.data.team = data.team;
		        self.data.opponent = data.opponent;
		        console.log(data);

		        //update json for all players
		        JsonService.updateLiveData(self.data.team, self.data.opponent, self.data.aflgames)

		        self.deferred.resolve(self.data);
		        return self.data
		        //updateStats();
		       // updateLiveData();
		       // $scope.refreshing=false;

		    }, 0);

	    	//getOppositionData(data.opponent.id);
	    	
	    	
	    })
	    .fail  (function(jqXHR, textStatus, errorThrown) { alert("Error")   ; })
	    .always(function(jqXHROrData, textStatus, jqXHROrErrorThrown)     {  });
	    return self.deferred.promise;
	 }

	 // function getData()
	 // {
	 // 	if (!deferred) {
	 //        //save the httpPromise
	 //        self.data = getData();
	 //      }
	 //      return dataPromise;
	 //    }
	 // //    return sonService;
	 // // }
	
})
angular.module("supercoach")

.controller('HomeController', function($scope, $http, $timeout, $window, $sce, ScService){
	console.log("This is the home controller");
	var self = this;
	
	// $scope.getPlayingClass = getPlayingClass;
	$scope.getTotalLiveScore = getTotalLiveScore;
	$scope.getPPM = getPPM;
	// $scope.getData = getData;
	
	/**
	 * Load Data
	 */
	$scope.$watch(function(){ return ScService.getDataValue(); }, function(data) {

	    console.log("New Data", data);
	    $scope.data = data;
	   // $scope.controllerData = data;
	  }, true);




	//var url = "http://supercoach.heraldsun.com.au/afl/draft/service/match_centre/update/";
	
	

	//  getData();
	// getTeamData();


	 

	 


	 //update stats
	 function updateStats()
	 {
	 	$scope.playerstats = [];
	 	for(var k in $scope.data.fixture.games)
	 	{
	 		
	 		if($scope.data.fixture.games[k].game_status != 'pre')
	 		{

	 			round = $scope.data.fixture.games[k].round;
	 			game = $scope.data.fixture.games[k].game_num;
	 			if(round.length==1) round = '0'+round;

	 			$http({
					  method: 'GET',
					  url: 'http://api.stats.foxsports.com.au/3.0/api/sports/afl/matches/AFL2017'+round+'0'+game+'/playerstats.json?userkey=6B2F4717-A97C-49F6-8514-3600633439B9'
					}).then(function successCallback(response) {
					    $scope.playerstats.push(response.data);
					  }, function errorCallback(response) {
					    // called asynchronously if an error occurs
					    // or server returns response with an error status.
					  });
	 		}
	 	}
	 }

	 function getTeamData()
	 {
		 	$http({
						  method: 'GET',
						  url: 'teams.php'
						}).then(function successCallback(response) {
						    $scope.teamData = response.data;
						  }, function errorCallback(response) {
						    // called asynchronously if an error occurs
						    // or server returns response with an error status.
						  });
	 }

	



	 $scope.getStatInfo = function(player)
	 {
	 	if(player.played_status == 'pre') return;

	 	if(typeof $scope.playerstats == 'undefined') return "";
	 	
	 	//console.log($scope.playerstats);
	 	if(player.ln == "Johannisen") player.ln = "Johannissen"; //fix for mis spelt name



	 	playername = player.fi + '. ' + player.ln;
	 	
	 	for(var k in $scope.playerstats)
	 	{
	 		for(var j in $scope.playerstats[k].team_A.players)
	 		{
	 			if($scope.playerstats[k].team_A.players[j].short_name == playername)
	 				return formatStats($scope.playerstats[k].team_A.players[j].stats, player.pos);
	 		}

	 		for(var i in $scope.playerstats[k].team_B.players)
	 		{	
	 			
	 			if($scope.playerstats[k].team_B.players[i].short_name == playername){
	 				return formatStats($scope.playerstats[k].team_B.players[i].stats, player.pos);
	 			}
	 		}
	 	}
	 }

	 function formatStats(stats, pos)
	 {
	 	

	 	var s = "";
	 	s = s + stats.goals + " goal";
	 	if(stats.goals != 1) s = s + 's';

	 	s = s + " " + stats.behinds + " behind";
	 	if(stats.behinds != 1) s = s + 's';
	 	s = s + "<br>";
		
		if(pos == "RUC"){
			s = s + stats.hitouts + " hitout";
	 		if(stats.hitouts != 1) s = s + 's';
		}else{
			s = s + stats.tackles + " tackle";
	 		if(stats.tackles != 1) s = s + 's';
		}
		
	 	s = s + "<br>";
		
		s = s + stats.disposals + " disposal";
	 	if(stats.disposals != 1) s = s + 's';


	 	return $sce.trustAsHtml(s);
	 }




	/**
	 * Get the score to show at the top of the main view
	 * This will also check to see if any player isnt playing, and if so, then pick up your lowest bench player
	 */
	function getTotalLiveScore(players, bench)
	{

		livescore = 0;
		includeBenchPlayer = false;
		ppm = 0;

		for(var k in players)
		{
			points = players[k].livepts!=0?players[k].livepts:players[k].points;

			livescore = parseInt(livescore) + parseInt(points);


			if(points=='0' && players[k].played_status != 'pre') includeBenchPlayer = true;
		}

		if(includeBenchPlayer && typeof bench != 'undefined')
		{
			benchScore = 0;
			for(var j in bench){
				bpoints = bench[j].livepts!=0?bench[j].livepts:bench[j].points;
				
				if(bpoints != 0){
					if(benchScore == 0) 
						benchScore = bpoints;
					else if(parseInt(bpoints) < benchScore)  
						benchScore = bpoints;

				} 
			}

			
			livescore = parseInt(livescore) + parseInt(benchScore);
		}


		return livescore;
	}

	/**
	 * Get PPM
	 */
	function getPPM(players,bench)
	{
		livescore = 0;
		includeBenchPlayer = false;
		ppm = 0;
		played_players = 0;

		for(var k in players)
		{
			points = players[k].livepts!=0?players[k].livepts:players[k].points;

			/**
			 * Calculate the PPM for this player
			 */
			if(players[k].played_status == 'post'){
				ppm = ppm + (points/80);
				played_players++;
			} 
			if(players[k].played_status == 'now'){
				player_team = players[k].team;
				for (var k in $scope.data.aflgames)
		    	{
		    		if($scope.data.aflgames[k].team1_abbrev == player_team || $scope.data.aflgames[k].team2_abbrev == player_team) {
		    			if($scope.data.aflgames[k].period_status == 'Half time') minutes = 40;
		    			else if($scope.data.aflgames[k].period_status == 'Quarter time') minutes = 20;
		    			else if($scope.data.aflgames[k].period_status == '3Quarter time') minutes = 60;
		    			else
		    			{
		    				minutes = (($scope.data.aflgames[k].period-1)*20)+($scope.data.aflgames[k].period_seconds/60);
		    			}
		    		}
		    	}
				ppm = ppm + (points/minutes);
				played_players++;
			} 


			if(points=='0' && players[k].played_status != 'pre') includeBenchPlayer = true;
		}

		// if(includeBenchPlayer && typeof bench != 'undefined')
		// {
		// 	benchScore = 0;
		// 	for(var j in bench){
		// 		bpoints = bench[j].livepts!=0?bench[j].livepts:bench[j].points;
				
		// 		if(bpoints != 0){
		// 			if(benchScore == 0) 
		// 				benchScore = bpoints;
		// 			else if(parseInt(bpoints) < benchScore)  
		// 				benchScore = bpoints;

		// 		} 
		// 	}

			
		// 	livescore = livescore + benchScore;
		// }


		return  (ppm/played_players).toFixed(2);
	}

	


    /**
     * used for the real game list, gets a summary of the top 5 players
     */
    $scope.getTop5Scores = function(players)
    {
    	var game_started=false;
    	for(var l in players)
    	{
    		
    		if(players[l].points > 0){
    			game_started=true;
    		}
    	}

    	if(players[0].team_played_status=='pre' && game_started == false ) return "Game not started";

    	if(players[0].team_played_status=='now') return "Game In Progress (" + $scope.getCurrentQuarter(players[0].team) + ")";

    	
    	player_array = [];
    	for(var i in players){
    		player = Array();
    		player.name = players[i].fi + ". " + players[i].ln;
    		player.points= parseInt(players[i].livepts);
    		player_array.push(player);
    	}

    	ordered = _.orderBy(player_array, 'points','desc');
    	//ordered = player_array.sort(points);

    	str = "";
    	for(var k in ordered)
    	{
    		if(k==5) return str;

    		str = str + ordered[k].name + " " + ordered[k].points + " ";
    	}
    }


   
	
	/**
	 * true or false if game has been selected or not
	 */
	 $scope.gameLocked = function(gametime)
	 {
	 
	 	var date = new Date(gametime*1000);
	 	var day_of_week = date.getDay();

	 	if(day_of_week==4 || day_of_week==5) //thursday + friday
	 	{
	 		days_before = 1;
	 	}else{
	 		days_before = 2;
	 	}

	 	//get date that way {{days_before}} before the gametime
	 	date.setDate(date.getDate()-days_before);

	 	//change the time to 6:30pm
	 	date.setHours(18,45,0,0);
	 	now = new Date();
	 	

	 	if(date > now){
	 		
	 		return false;
	 	}
	 	else{
	 		
	 		return true;
	 	}
	 		
	 }


	 
	
})
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

angular.module('templates').run(['$templateCache', function($templateCache) {$templateCache.put('aflgame/aflgame.template.html','<div class="aflgame-header">\r\n\t<div class="team-score">\r\n\t\t<div class="team-score-number">{{game.team1_score}}</div>\r\n\t\t<div class="team-score-logo teamlogo teamlogo-{{game.team1_abbrev | lowercase}}"></div>\r\n\t\t<div class="team-score-teamname">{{game.team1_name}}</div>\r\n\t</div>\r\n\t<div class="team-score">\r\n\t\t<div class="team-score-number">{{game.team2_score}}</div>\r\n\t\t<div class="team-score-logo teamlogo teamlogo-{{game.team2_abbrev | lowercase}}"></div>\r\n\t\t<div class="team-score-teamname">{{game.team2_name}}</div>\r\n\t</div>\r\n\t<div class="team-score-footer">\r\n\t\t<div ng-if="game.match_status==\'Complete\'">Match Complete. {{ parseInt(game.team2_score) > parseInt(game.team1_score) ? game.team2_name : game.team1_name }} by {{ Math.abs(game.team2_score - game.team1_score) }}</div>\r\n\t\t<div style="text-align: right;" ng-if="game.game_status==\'pre\'">{{game.date}}</div>\r\n\t</div>\r\n</div>\r\n\r\n<table class="aflgametable">\r\n\t<tr ng-repeat="player in players | orderBy:\'-score\'">\r\n\t\t<td><div class="teamlogo teamlogo-sm teamlogo-{{player.team | lowercase}}"></div></td>\r\n\t\t<td>{{player.player}}</td>\r\n\t\t<td style="width:13%">{{player.score}}<span class="time-since" ng-class="formatTimestamp(player.timestamp)>5?\'time-since-red\':\'\'">{{formatTimestamp(player.timestamp)}}<span ng-if="formatTimestamp(player.timestamp)">M</span></span></td>\r\n\t</tr>\r\n</table>\r\n\r\n<!-- -Math.min(parseInt(game.team2_score),parseInt(game.team1_score)) -->');
$templateCache.put('cookie/cookie.template.html','<div id="parent" style="padding:10px;">\r\n\r\n<div>Please enter your php session ID</div><br>\r\n<input ng-model="phpsessionid" />\r\n<button ng-click="save()">Save</button>\r\n\r\n\r\n<h3>Where do I find it?</h3>\r\n<div>You need to be on your desktop. Browse to the supercoach site, log in, and look at your cookies. In chrome this is the step by step:</div>\r\n<ol>\r\n\t<li>Press F12 to bring up the dev tools</li>\r\n\t<li>Go to the application tab</li>\r\n\t<li>Expand the Cookies menu, and select http://supercoach.heraldsun.com.au</li>\r\n\t<li>Find the record that has a name of PHPSESSID</li>\r\n\t<li>Put the value into the box above and save. This number will be 32 characters long.</li>\r\n</ol>\r\n</div>');
$templateCache.put('home/home.template.html','<div id="parent">\r\n\r\n\r\n<!-- TEAM TOTALS BANNER -->\r\n<table class="team-totals">\r\n\t<tr>\r\n\t\t<td>\r\n\t\t\t<div class="team-card">\r\n\t\t\t<div class="team-total-score">\r\n\t\t\t\t<div class="actual">{{getTotalLiveScore(data.team.player_list.field.players, data.team.player_list.bench.players)}}</div>\r\n\t\t\t\t<div class="projected">{{data.team.team_total_proj_points}}</div>\r\n\t\t\t\t<div class="projected" style="font-size: 0.9em">{{getPPM(data.team.player_list.field.players, data.team.player_list.bench.players)}} PPM</div>\r\n\r\n\t\t\t</div>\r\n\t\t\t\t<div class="shirt" style="float:left">\r\n\r\n\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t\r\n\t\t\t\t<div class="team-name" style="clear:left">{{data.team.name}}</div>\r\n\t\t\t\t<div class="team-record">{{data.team.league.wins}}-{{data.team.league.draws}}-{{data.team.league.losses}}</div>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t\t<td>\r\n\t\t\t<div class="team-card" style="text-align: right;">\r\n\t\t\t\t<div class="team-total-score" style="float:left">\r\n\t\t\t\t\t<div class="actual" style="text-align: left">{{getTotalLiveScore(data.opponent.player_list.field.players, data.opponent.player_list.bench.players)}}</div>\r\n\t\t\t\t\t<div class="projected" style="text-align: left">{{data.opponent.team_total_proj_points}}</div>\r\n\t\t\t\t\t<div class="projected" style="font-size: 0.9em">{{getPPM(data.opponent.player_list.field.players, data.opponent.player_list.bench.players)}} PPM</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t\t<div class="shirt" style="float:right">\r\n\r\n\t\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<div class="team-name" style="clear:right">{{data.opponent.name}}</div>\r\n\t\t\t\t\t<div class="team-record">{{data.opponent.league.wins}}-{{data.opponent.league.draws}}-{{data.opponent.league.losses}}</div>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n<table class="players-table">\r\n\t<tr>\r\n\r\n\t\t<!-- LEFT -->\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.team.player_list.field.players">\r\n\t\t\t<div player="player"></div>\r\n\t\t\t<!-- <div class="player-card " ng-class="getPlayingClass(player.played_status)">\r\n\t\t\t\t<div class="player-score">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts!=0?player.livepts:player.points}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t\t<div class="quarter" ng-if="player.match_status==\'In Play\'">{{getCurrentQuarter(player.team)}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name">{{player.fi}}. {{player.ln}} \r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'none\' && gameLocked(player.kickoff_time)==true" class="player-status-inj">OUT</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span>\r\n\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'loading\'" class="player-status-playing"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>\r\n\t\t\t\t</div>\r\n\t\t\t\t\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t<div ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div> -->\r\n\t\t</div>\r\n\t\t</td>\r\n\t<!-- MIDDLE -->\r\n\t\t<td class="table-position">\r\n\t\t\t<div class="position-label" ng-repeat="player in data.team.player_list.field.players">{{player.pos}}</div>\r\n\t\t</td>\r\n\r\n\t<!-- RIGHT -->\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.opponent.player_list.field.players">\r\n\t\t\t<div player="player" ha=\'away\'></div>\r\n\t\t\t<!-- <div class="player-card player-card-r" ng-class="getPlayingClass(player.played_status)+\'-r\'">\r\n\t\t\t\t<div class="player-score-r">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts!=0?player.livepts:player.points}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t\t<div class="quarter" ng-if="player.match_status==\'In Play\'">{{getCurrentQuarter(player.team)}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name">\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'none\' && gameLocked(player.kickoff_time)==true" class="player-status-inj">OUT</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span> {{player.fi}}. {{player.ln}}</div>\r\n\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'loading\'" class="player-status-playing"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t\t<div style="text-align: right" ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div> -->\r\n\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n<div class="bench-label">\r\n<table>\r\n\t<tr>\r\n\t\t<td>BENCH</td>\r\n\t\t<td style="text-align:right">BENCH</td>\r\n\t</tr>\r\n</table>\r\n</div>\r\n\r\n<table class="players-table">\r\n\t<tr>\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.team.player_list.bench.players">\r\n\t\t\t<div player="player"></div>\r\n\t\t\t<!-- <div class="player-card " ng-class="getPlayingClass(player.played_status)">\r\n\t\t\t\t<div class="player-score">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts!=0?player.livepts:player.points}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t\t<div class="quarter" ng-if="player.match_status==\'In Play\'">{{getCurrentQuarter(player.team)}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name">{{player.fi}}. {{player.ln}} \r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'none\' && gameLocked(player.kickoff_time)==true" class="player-status-inj">OUT</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'loading\'" class="player-status-playing"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>\r\n\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t<div ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div> -->\r\n\t\t</div>\r\n\t\t</td>\r\n\r\n\t\t<td class="table-position">\r\n\t\t\t<div class="position-label" ng-repeat="player in data.team.player_list.bench.players">BEN</div>\r\n\t\t</td>\r\n\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.opponent.player_list.bench.players">\r\n\t\t\t<div player="player" ha="away"></div>\r\n\t\t\t<!-- <div class="player-card  player-card-r" ng-class="getPlayingClass(player.played_status)+\'-r\'" >\r\n\t\t\t\t<div class="player-score-r">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts!=0?player.livepts:player.points}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t\t<div class="quarter" ng-if="player.match_status==\'In Play\'">{{getCurrentQuarter(player.team)}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name">\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'none\' && gameLocked(player.kickoff_time)==true" class="player-status-inj">OUT</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span> {{player.fi}}. {{player.ln}}</div>\r\n\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'loading\'" class="player-status-playing"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t\t<div ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div> -->\r\n\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n\r\n\r\n\r\n\r\n\r\n<!-- \r\n\t<table class="team-table" style="float:left">\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4><div class="team-name">{{data.team_name}}</div><div class="coach-name">{{data.first_name}}</div></td>\r\n\t\t</tr>\r\n\t\t<tr ng-repeat="player in data.myplayers" >\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.livepts}} ({{player.proj_points}})</td>\r\n\t\t</tr>\r\n\t\t\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4>Bench</td>\r\n\t\t</tr>\r\n\r\n\t\t<tr ng-repeat="player in data.mybench" >\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.livepts}}({{player.proj_points}})</td>\r\n\t\t</tr>\r\n\r\n\t</table>\r\n\r\n\t<table class="team-table" style="float:right">\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4><div class="team-name">Placeholder</div><div class="coach-name">{{data.opponent.coach}}</div></td>\r\n\t\t</tr>\r\n\t\t<tr ng-show="data.opponent.player_list.field.players.length==0"><td colspan=4>Waiting for lockout</td></tr>\r\n\t\t<tr ng-repeat="player in data.opponent.player_list.field.players" >\r\n\t\t\t<td>{{player.livepts}} ({{player.proj_points}})</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t</tr>\r\n\t\t\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4>Bench</td>\r\n\t\t</tr>\r\n\r\n\t\t<tr ng-repeat="player in data.opponent.player_list.bench.players" >\r\n\t\t\t<td>{{player.livepts}}({{player.proj_points}})</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t</tr>\r\n\t\t<tr ng-show="data.opponent.player_list.bench.players.length==0"><td colspan=4>Waiting for lockout</td></tr>\r\n\r\n\t</table> -->\r\n</div>');
$templateCache.put('home/player.template.html','<div class="player-card " ng-class="[getPlayingClass(player.played_status, ha),ha==\'away\' ? \'player-card-r\' : \'\']">\r\n\t<!-- score -->\r\n\t<div ng-class="ha==\'away\'?\'player-score-r\':\'player-score\'">\r\n\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts!=0?player.livepts:player.points}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t<div class="quarter" ng-if="player.match_status==\'In Play\'">{{getCurrentQuarter(player.team)}}</div>\r\n\t</div>\r\n\t<!-- name -->\r\n\t<div class="player-name"><span ng-if="ha==\'home\'">{{player.fi}}. {{player.ln}} </span>\r\n\t\t<span ng-if="getPlayerSelection(player.fn,player.ln)==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t<span ng-if="getPlayerSelection(player.fn,player.ln)==\'none\' && gameLocked(player.kickoff_time)==true" class="player-status-inj">OUT</span>\r\n\t\t<span ng-if="getPlayerSelection(player.fn,player.ln)==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t<span ng-if="getPlayerSelection(player.fn,player.ln)==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span><span ng-if="ha==\'away\'"> {{player.fi}}. {{player.ln}}</span>\r\n\t<span ng-if="getPlayerSelection(player.fn,player.ln)==\'loading\'" class="player-status-playing"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>\r\n\t</div>\r\n\t\r\n\t<!-- game state -->\r\n\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t</div>\r\n\r\n\t<!-- stats -->\r\n\t<div class="stat-info">\r\n\t\t<div ng-class="ha==\'away\'?\'align-right\':\'\'" ng-bind-html="getStatInfo(player)"></div>\r\n\t</div>\r\n\r\n</div>\r\n\r\n\r\n\r\n\r\n<!-- <div class="player-card player-card-r" ng-class="" ng-class="getPlayingClass(player.played_status, ha)">\r\n\t\t\t\t<div class="player-score-r">\r\n\t\t\t\t\t<div ng-class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts!=0?player.livepts:player.points}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t\t<div class="quarter" ng-if="player.match_status==\'In Play\'">{{getCurrentQuarter(player.team)}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name">\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'none\' && gameLocked(player.kickoff_time)==true" class="player-status-inj">OUT</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span> {{player.fi}}. {{player.ln}}</div>\r\n\t\t\t\t<span ng-if="getPlayerStatus(player.fn,player.ln)==\'loading\'" class="player-status-playing"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>\r\n\t\t\t\t\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t\t<div style="text-align: right" ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div> -->');
$templateCache.put('navbar/navbar.template.html','<div class="header">\r\n<div style="float:left" ng-click="toggleSC()"><i class="fa fa-caret-down" aria-hidden="true"></i>League</div>\r\n<div style="float:right" ng-click="toggleAFL()">AFL<i class="fa fa-caret-down" aria-hidden="true"></i></div>\r\n<i ng-click="getData(0,true)" ng-show="refreshing!=true" class="fa fa-refresh fa-3x" aria-hidden="true"></i>\r\n<i ng-show="refreshing==true" class="fa fa-refresh fa-spin fa-3x fa-fw"></i>\r\n</div>\r\n\r\n<div id="sc-menu" style="display:none; clear:left">\r\n<!-- GAMES IN MY SC LEAGUE -->\r\n<div class="league" style="clear:left">\r\n\t<div class="league-game" ng-repeat="game in leaguegames"  ng-click="getData(game.team_1.team_id, true); toggleSC();gotoScGame();">\r\n\r\n\t\t<div class="league-game-team">\r\n\t\t\t<div class="league-game-score">{{game.team_1.points}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="shirt">\r\n\t\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team_1.team_name}}</div>\r\n\t\t\t\t<div class="remaining">{{game.team_1.yet_to_play}} left | {{game.team_1.in_play}} in play</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\t\t<div class="league-game-team" style="margin-top: 1px;">\r\n\t\t\t<div class="league-game-score">{{game.team_2.points}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="shirt">\r\n\t\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team_2.team_name}}</div>\r\n\t\t\t\t<div class="remaining">{{game.team_2.yet_to_play}} left | {{game.team_2.in_play}} in play</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\r\n\t</div>\r\n</div>\r\n</div>\r\n\r\n<div id="afl-menu" style="display:none; clear:left">\r\n<!-- AFL GAMES -->\r\n<div class="league" style="clear:left">\r\n\t<div class="league-game" ng-repeat="game in aflgames"  ng-click="gotoGame(game.id);toggleAFL();">\r\n\r\n\t\t<div class="league-game-team">\r\n\t\t\t<div class="league-game-score">{{game.team1_score}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="teamlogo teamlogo-{{game.team1_abbrev | lowercase}}">\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team1_name}}</div>\r\n\t\t\t\t<div class="remaining">{{getTop5Scores(game.team1_players.players)}}</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\t\t<div class="league-game-team" style="margin-top: 1px;">\r\n\t\t\t<div class="league-game-score">{{game.team2_score}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="teamlogo teamlogo-{{game.team2_abbrev | lowercase}}">\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team2_name}}</div>\r\n\t\t\t\t<div class="remaining">{{getTop5Scores(game.team2_players.players)}}</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\r\n\t</div>\r\n</div>\r\n</div>\r\n\r\n');}]);