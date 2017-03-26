angular.module("supercoach",['ngRoute','templates'])
.config(function($sceDelegateProvider) {
 $sceDelegateProvider.resourceUrlWhitelist([
   // Allow same origin resource loads.
   'self',
   // Allow loading from our assets domain.  Notice the difference between * and **.
   'http://supercoach.heraldsun.com.au/**']);
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
			.when('/getcookie', {
				templateUrl : 'app/js/cookie/cookie.template.html',
				controller  : 'CookieController as ctrl'
			});;

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

.controller('HomeController', function($scope, $http, $timeout, $window, $sce){
	console.log("This is the home controller");
	var self = this;
	
	$scope.getPlayingClass = getPlayingClass;
	$scope.getTotalLiveScore = getTotalLiveScore;
	$scope.getData = getData;
	/**
	 * Check if we have the php session cookie from the supercoach site!
	 */
	if(readCookie("phpsessionid") == null){
		$window.location.href = '/#!/getcookie';
	}

	if(readCookie("phpsessionid").length != 32){
		$window.location.href = '/#!/getcookie';
	}


	$scope.toggleMenu = function()
	{
		if($("#menu").is(":visible") )
			$("#menu").slideUp("fast");
		else
			$("#menu").slideDown("fast");
	}



	//var url = "http://supercoach.heraldsun.com.au/afl/draft/service/match_centre/update/";
	
	 $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	    console.log(options);
	    if (options.url.match(/^http?:/)) {
	        // options.headers['X-Proxy-URL'] = options.url;
	         jqXHR.setRequestHeader('X-Proxy-URL', options.url);
	        // jqXHR.setRequestHeader('phpsesh', "d8491ffd050fa19e2690cf57d05ca6fb");
	         jqXHR.setRequestHeader('phpsesh', readCookie("phpsessionid"));
	       
	        options.url = '/proxy.php';
	    }
	});

	 getData();
	


	 function getData(tid){
	 	$scope.refreshing=true;
	 	$scope.data = {};
	 	$.ajax({
	        url: "http://supercoach.heraldsun.com.au/afl/draft/service/match_centre/update/?",
	        data:{tid:tid,round:1,csurl:"http://supercoach.heraldsun.com.au/afl/draft/service/match_centre/update/"}
	    })
	    .done  (function(data, textStatus, jqXHR)        
	    { 
	    	console.log(data);

	    	if(typeof data.team == 'undefined') {
	    		alert("Code is invalid. Please try re enter");
	    		$window.location.href = '/#!/getcookie';
	    	}
	    	$timeout(function () {
	    		$scope.data = data;
		        $scope.data.myplayers =  data.team.player_list.field.players
		        $scope.data.mybench =  data.team.player_list.bench.players
		        $scope.data.opponent = data.opponent;
		        console.log(data.opponent);
		        updateStats();
		        $scope.refreshing=false;

		    }, 0);

	    	//getOppositionData(data.opponent.id);
	    	
	    	
	    })
	    .fail  (function(jqXHR, textStatus, errorThrown) { alert("Error")   ; })
	    .always(function(jqXHROrData, textStatus, jqXHROrErrorThrown)     {  });
	    
	 }

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
	 * REturn the class that we need to apply for if the player is playing or not
	 */
	function getPlayingClass(status)
	{
		if(status == "now") return "playing";
		if(status == "post") return "finished";

		return "not-played";
	}

	function getTotalLiveScore(players)
	{
		livescore = 0;
		for(var k in players)
		{
			livescore = livescore + parseInt(players[k].livepts);
		}

		return livescore;
	}

	 /**
	  * Cookie functions
	  * 
	  */
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


    $scope.getTop5Scores = function(players)
    {
    	if(players[0].team_played_status=='pre') return;

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


    $scope.getCurrentQuarter = function(player_team)
    {
    	for (var k in $scope.data.fixture.games)
    	{
    		if($scope.data.fixture.games[k].team1_abbrev == player_team || $scope.data.fixture.games[k].team2_abbrev == player_team) {
    			if($scope.data.fixture.games[k].period_status == 'Half time') return 'HT';
    			else
    				return 'Q'+$scope.data.fixture.games[k].period;
    		}
    	}
    }
	
	  
	
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
angular.module('templates').run(['$templateCache', function($templateCache) {$templateCache.put('home/home.template.html','<div id="parent">\r\n<div class="header">\r\n<div style="float:left" ng-click="toggleMenu()"><i class="fa fa-bars fa-3x" aria-hidden="true"></i></div>\r\n\r\nSC James Style\r\n<i ng-click="getData()" ng-show="refreshing==false" style="float:right" class="fa fa-refresh fa-3x" aria-hidden="true"></i>\r\n<i ng-show="refreshing==true" style="float:right" class="fa fa-refresh fa-spin fa-3x fa-fw"></i></div>\r\n\r\n<!-- <div class="league">\r\n\t\r\n\r\n<div class="league-team-name" ng-repeat="game in data.schedule.games" style="width:{{93/data.schedule.games.length}}%" ng-click="getData(game.team_1.team_id)">\r\n\t\t{{game.team_1.team_name}}<br>v<br>\r\n\t\t{{game.team_2.team_name}}\r\n\t\t</div></div> -->\r\n<div id="menu" style="display:none; clear:left">\r\n\r\n<div class="league" style="clear:left">\r\n\t<div class="league-game" ng-repeat="game in data.schedule.games"  ng-click="getData(game.team_1.team_id); toggleMenu();">\r\n\r\n\t\t<div class="league-game-team">\r\n\t\t\t<div class="league-game-score">{{game.team_1.points}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="shirt">\r\n\t\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team_1.team_name}}</div>\r\n\t\t\t\t<div class="remaining">{{game.team_1.yet_to_play}} left | {{game.team_1.in_play}} in play</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\t\t<div class="league-game-team" style="margin-top: 1px;">\r\n\t\t\t<div class="league-game-score">{{game.team_2.points}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="shirt">\r\n\t\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team_2.team_name}}</div>\r\n\t\t\t\t<div class="remaining">{{game.team_2.yet_to_play}} left | {{game.team_2.in_play}} in play</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\r\n\t</div>\r\n</div>\r\n\r\n<div class="league" style="clear:left">\r\n\t<div class="league-game" ng-repeat="game in data.fixture.games"  ng-click="toggleMenu();">\r\n\r\n\t\t<div class="league-game-team">\r\n\t\t\t<div class="league-game-score">{{game.team1_score}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="teamlogo teamlogo-{{game.team1_abbrev | lowercase}}">\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team1_name}}</div>\r\n\t\t\t\t<div class="remaining">{{getTop5Scores(game.team1_players.players)}}</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\t\t<div class="league-game-team" style="margin-top: 1px;">\r\n\t\t\t<div class="league-game-score">{{game.team2_score}}</div>\r\n\t\t\t<div class="league-game-details">\r\n\t\t\t\t<div class="logo">\r\n\t\t\t\t\t<div class="teamlogo teamlogo-{{game.team2_abbrev | lowercase}}">\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="name">{{game.team2_name}}</div>\r\n\t\t\t\t<div class="remaining">{{getTop5Scores(game.team2_players.players)}}</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\r\n\r\n\t</div>\r\n</div>\r\n\r\n\r\n</div>\r\n\r\n<table class="team-totals">\r\n\t<tr>\r\n\t\t<td>\r\n\t\t\t<div class="team-card">\r\n\t\t\t<div class="team-total-score">\r\n\t\t\t\t<div class="actual">{{getTotalLiveScore(data.myplayers)}}</div>\r\n\t\t\t\t<div class="projected">{{data.team.team_total_proj_points}}</div>\r\n\r\n\t\t\t</div>\r\n\t\t\t\t<div class="shirt" style="float:left">\r\n\r\n\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t\r\n\t\t\t\t<div class="team-name" style="clear:left">{{data.team.name}}</div>\r\n\t\t\t\t<div class="team-record">{{data.team.league.wins}}-{{data.team.league.draws}}-{{data.team.league.losses}}</div>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t\t<td>\r\n\t\t\t<div class="team-card" style="text-align: right;">\r\n\t\t\t\t<div class="team-total-score" style="float:left">\r\n\t\t\t\t\t<div class="actual" style="text-align: left">{{getTotalLiveScore(data.opponent.player_list.field.players)}}</div>\r\n\t\t\t\t\t<div class="projected" style="text-align: left">{{data.opponent.team_total_proj_points}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t\t<div class="shirt" style="float:right">\r\n\r\n\t\t\t\t\t\t<div class="shorts"></div>\r\n\t\t\t\t\t\t<div class="shirt-jumper"></div>\r\n\t\t\t\t\t\t<div class="pattern"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<div class="team-name" style="clear:right">{{data.opponent.name}}</div>\r\n\t\t\t\t\t<div class="team-record">{{data.opponent.league.wins}}-{{data.opponent.league.draws}}-{{data.opponent.league.losses}}</div>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n<table class="players-table">\r\n\t<tr>\r\n\r\n\t\t<!-- LEFT -->\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.myplayers">\r\n\t\t\t<div class="player-card " ng-class="getPlayingClass(player.played_status)">\r\n\t\t\t\t<div class="player-score">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t\t<div class="quarter" ng-if="player.match_status==\'In Play\'">{{getCurrentQuarter(player.team)}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name">{{player.fi}}. {{player.ln}} \r\n\t\t\t\t\t<span ng-if="player.status==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span>\r\n\t\t\t\t</div>\r\n\t\t\t\t\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t<div ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t</td>\r\n\t<!-- MIDDLE -->\r\n\t\t<td class="table-position">\r\n\t\t\t<div class="position-label" ng-repeat="player in data.myplayers">{{player.pos}}</div>\r\n\t\t</td>\r\n\r\n\t<!-- RIGHT -->\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.opponent.player_list.field.players">\r\n\t\t\t<div class="player-card player-card-r" ng-class="getPlayingClass(player.played_status)+\'-r\'">\r\n\t\t\t\t<div class="player-score-r">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name"><span ng-if="player.status==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span> {{player.fi}}. {{player.ln}}</div>\r\n\t\t\t\t\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t\t<div style="text-align: right" ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n<div class="bench-label">\r\n<table>\r\n\t<tr>\r\n\t\t<td>BENCH</td>\r\n\t\t<td style="text-align:right">BENCH</td>\r\n\t</tr>\r\n</table>\r\n</div>\r\n\r\n<table class="players-table">\r\n\t<tr>\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.mybench">\r\n\t\t\t<div class="player-card " ng-class="getPlayingClass(player.played_status)">\r\n\t\t\t\t<div class="player-score">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name">{{player.fi}}. {{player.ln}} \r\n\t\t\t\t\t<span ng-if="player.status==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span>\r\n\t\t\t\t</div>\r\n\t\t\t\t\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t<div ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t</td>\r\n\r\n\t\t<td class="table-position">\r\n\t\t\t<div class="position-label" ng-repeat="player in data.mybench">BEN</div>\r\n\t\t</td>\r\n\r\n\t\t<td class="table-players">\r\n\t\t\t<div ng-repeat="player in data.opponent.player_list.bench.players">\r\n\t\t\t<div class="player-card  player-card-r" ng-class="getPlayingClass(player.played_status)+\'-r\'" >\r\n\t\t\t\t<div class="player-score-r">\r\n\t\t\t\t\t<div class="actual-score"><span ng-if="player.played_status!=\'pre\'">{{player.livepts}}</span><span ng-if="player.played_status==\'pre\'">--</span></div>\r\n\t\t\t\t\t<div class="projected-score">{{player.proj_points}}</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="player-name"><span ng-if="player.status==\'inj\'" class="player-status-inj">INJ</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'emerg\'" class="player-status-inj">E</span>\r\n\t\t\t\t\t<span ng-if="player.status==\'playing\'" class="player-status-playing"><i class="fa fa-check" aria-hidden="true"></i></span> {{player.fi}}. {{player.ln}}</div>\r\n\t\t\t\t\r\n\t\t\t\t<div class="game-info" ng-show="player.played_status==\'pre\'">\r\n\t\t\t\t\t<div class="game-time">{{player.match_status}}</div>\r\n\t\t\t\t\t<div class="opposition">v {{player.opp}}</div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t<div class="stat-info">\r\n\t\t\t\t\t<div ng-bind-html="getStatInfo(player)"></div>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n\r\n\r\n\r\n\r\n\r\n<!-- \r\n\t<table class="team-table" style="float:left">\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4><div class="team-name">{{data.team_name}}</div><div class="coach-name">{{data.first_name}}</div></td>\r\n\t\t</tr>\r\n\t\t<tr ng-repeat="player in data.myplayers" >\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.livepts}} ({{player.proj_points}})</td>\r\n\t\t</tr>\r\n\t\t\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4>Bench</td>\r\n\t\t</tr>\r\n\r\n\t\t<tr ng-repeat="player in data.mybench" >\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.livepts}}({{player.proj_points}})</td>\r\n\t\t</tr>\r\n\r\n\t</table>\r\n\r\n\t<table class="team-table" style="float:right">\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4><div class="team-name">Placeholder</div><div class="coach-name">{{data.opponent.coach}}</div></td>\r\n\t\t</tr>\r\n\t\t<tr ng-show="data.opponent.player_list.field.players.length==0"><td colspan=4>Waiting for lockout</td></tr>\r\n\t\t<tr ng-repeat="player in data.opponent.player_list.field.players" >\r\n\t\t\t<td>{{player.livepts}} ({{player.proj_points}})</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t</tr>\r\n\t\t\r\n\t\t<tr class="table-divider">\r\n\t\t\t<td colspan=4>Bench</td>\r\n\t\t</tr>\r\n\r\n\t\t<tr ng-repeat="player in data.opponent.player_list.bench.players" >\r\n\t\t\t<td>{{player.livepts}}({{player.proj_points}})</td>\r\n\t\t\t<td>{{player.opp}}</td>\r\n\t\t\t<td>{{player.fn}} {{player.ln}}</td>\r\n\t\t\t<td class="player-{{player.pos}}">{{player.pos}}</td>\r\n\t\t</tr>\r\n\t\t<tr ng-show="data.opponent.player_list.bench.players.length==0"><td colspan=4>Waiting for lockout</td></tr>\r\n\r\n\t</table> -->\r\n</div>');
$templateCache.put('cookie/cookie.template.html','<div id="parent" style="padding:10px;">\r\n\r\n<div>Please enter your php session ID</div><br>\r\n<input ng-model="phpsessionid" />\r\n<button ng-click="save()">Save</button>\r\n\r\n\r\n<h3>Where do I find it?</h3>\r\n<div>You need to be on your desktop. Browse to the supercoach site, log in, and look at your cookies. In chrome this is the step by step:</div>\r\n<ol>\r\n\t<li>Press F12 to bring up the dev tools</li>\r\n\t<li>Go to the application tab</li>\r\n\t<li>Expand the Cookies menu, and select http://supercoach.heraldsun.com.au</li>\r\n\t<li>Find the record that has a name of PHPSESSID</li>\r\n\t<li>Put the value into the box above and save. This number will be 32 characters long.</li>\r\n</ol>\r\n</div>');}]);