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