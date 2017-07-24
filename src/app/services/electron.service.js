"use strict";

angular.module("mopify.services.electron", [])

.factory("electronService", function($location) {
    if(window.require == null || window.require("electron") == null) { return {}; }
    var remote = window.require("electron").remote;
    var settings = remote.getGlobal("settings");
    var $controls = null;

	return {
        available: true,
        settings: settings,
        createMenu: function() {
            remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(this.menu));
        },
        registerControls: function($scope) {
            $controls = $scope;
        },
        menu: [{
            label: "View",
            submenu: [{
                label: "Reload",
                accelerator: "CmdOrCtrl+R",
                click: function() {
                    remote.BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
                }
            }, {
                role: "togglefullscreen"
            }, {
                label: "Quit",
                accelerator: "Command+Q",
                click: function() {
                    remote.app.quit();
                }
            }]
        }, {
            label: "Edit",
            submenu: [{
                label: "Undo",
                accelerator: "CmdOrCtrl+Z",
                selector: "undo:"
            }, {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                selector: "redo:"
            }, {
                type: "separator"
            }, {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                selector: "cut:"
            }, {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                selector: "copy:"
            }, {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                selector: "paste:"
            }, {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                selector: "selectAll:"
            }]
        }, {
            label: "Actions",
            submenu: [{
                label: "Play previous track",
                accelerator: "Cmd+Left",
                click: function() {
                    $controls.prev();
                }
            }, {
                label: "Play next track",
                accelerator: "Cmd+Right",
                click: function() {
                    $controls.next();
                }
            }, {
                label: "Play/Pause",
                accelerator: "Cmd+P",
                click: function() {
                    $controls.playpause();
                }
            }, {
                label: "Stop playback",
                accelerator: "Cmd+S",
                click: function() {
                    $controls.stop();
                }
            }, {
                label: "Raise volume",
                accelerator: "Cmd+Up",
                click: function() {
                    $controls.raiseVolume();
                }
            }, {
                label: "Lover volume",
                accelerator: "Cmd+Down",
                click: function() {
                    $controls.lowerVolume();
                }
            }]
        }, {
            label: "Navigate",
            submenu: [{
                label: "Queue",
                accelerator: "Cmd+1",
                click: function() {
                    $location.path("/music/tracklist/mopidy:current");
                }
            }, {
                label: "Featured Playlists",
                accelerator: "Cmd+2",
                click: function() {
                    $location.path("/discover/featured");
                }
            }, {
                label: "New Releases",
                accelerator: "Cmd+3",
                click: function() {
                    $location.path("/discover/newreleases");
                }
            }, {
                label: "Playlists",
                accelerator: "Cmd+4",
                click: function() {
                    $location.path("/music/playlists");
                }
            }, {
                label: "Songs",
                accelerator: "Cmd+5",
                click: function() {
                    $location.path("/music/tracklist/spotify:library:songs");
                }
            }, {
                label: "Albums",
                accelerator: "Cmd+6",
                click: function() {
                    $location.path("/music/albums");
                }
            }, {
                label: "Artists",
                accelerator: "Cmd+7",
                click: function() {
                    $location.path("/music/artists");
                }
            }, {
                label: "Stations",
                accelerator: "Cmd+8",
                click: function() {
                    $location.path("/music/stations");
                }
            }]
        }]
    };
});
