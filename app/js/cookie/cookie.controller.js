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