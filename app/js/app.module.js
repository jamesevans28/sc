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