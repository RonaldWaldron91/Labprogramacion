/**
 * Created by USER on 25/05/2016.
 */

if(!window.localStorage.levelsEnd){
    localStorage.levelsEnd = JSON.stringify([]);
}

var storageLevel =  function (level){
    if(level == 0) return;
    if(window.localStorage.levelsEnd !== undefined){
        var levels = JSON.parse(window.localStorage.levelsEnd);
        if(levels.indexOf(level) == -1){
            levels.push(level);
            localStorage.levelsEnd = JSON.stringify(levels);
        }
    }
};

var checkLevelStorage = function (level) {
    if(window.localStorage.levelsEnd !== undefined) {
        var levels = JSON.parse(window.localStorage.levelsEnd);
        if(levels.indexOf(level) != -1){
            return true;
        }
    }
    return false;
};

var getLevelStorage = function () {
    var levels = [];
    if(window.localStorage.levelsEnd !== undefined) {
        levels = JSON.parse(window.localStorage.levelsEnd);
    }
    return levels;
};