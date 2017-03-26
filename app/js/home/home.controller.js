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

	
	  
	
})