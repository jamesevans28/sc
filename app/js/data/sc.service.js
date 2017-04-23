
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