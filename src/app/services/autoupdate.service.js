"use strict";

angular.module("mopify.services.autoupdate", [
    "mopify.services.settings"
])

.factory("AutoUpdate", function($q, $http, $location, $rootScope, Settings, electronService){
    var protocol = electronService.available ? "http" : $location.protocol();
    var canupdate = false;

    var mopidyip = Settings.get("mopidyip", $location.host());
    var mopidyport = Settings.get("mopidyport", $location.port());

    function AutoUpdate(){
        this.autoupdate = Settings.get("autoupdate", false);
    }

    /**
     * Check if we can autoupdate
     * @return promise
     */
    AutoUpdate.prototype.check = function(){
        var deferred = $q.defer();

        // Make request
        $http.get(protocol + "://" + mopidyip + ':' + mopidyport + '/mopify/update').success(function(data){
            canupdate = data.response;
            deferred.resolve(canupdate);
        }).error(function(data){
            canupdate = false;
            deferred.reject(canupdate);
        });

        return deferred.promise;
    };

    /**
     * Run an automatic update
     * @return promise
     */
    AutoUpdate.prototype.runUpdate = function(){
        var deferred = $q.defer();

        // Check if we can update
        if(canupdate){
            // Make request
            $http.post(protocol + "://" + mopidyip + ':' + mopidyport + '/mopify/update').success(function(data){
                deferred.resolve(data);

                // Broadcast update message
                $rootScope.$broadcast("mopify:update:succesfull", data);
            }).error(function(data){
                deferred.reject(data);
            });
        }
        else{
            deferred.reject({"response": "Can't update since Mopidy isn't running as root."});
        }

        return deferred.promise;
    };

    return new AutoUpdate();
});