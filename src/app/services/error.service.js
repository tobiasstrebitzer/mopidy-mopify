'use strict';

angular.module('ErrorCatcher', [
])

.factory('$exceptionHandler', function ($window) {

    return function errorCatcherHandler(exception, cause) {
        console.error(exception.stack);
        
        if($window.ga) {
            $window.ga('send', 'exception', {
              'exDescription': exception.stack
            });
        }
    };

});