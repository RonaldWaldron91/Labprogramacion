/**
 * Created by USER on 19/05/2016.
 */
'use strict';

/**
 * Go to the next level.
 */
BlocklyInterface.nextLevel = function(level) {
    if(level !== undefined) BlocklyGames.LEVEL = level;
    
    if ((BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL && !checkLevelStorage(BlocklyGames.MAX_LEVEL)) || BlocklyGames.LEVEL == -1 ) {
        window.location = window.location.protocol + '//' +
            window.location.host + window.location.pathname +
            '?lang=' + BlocklyGames.LANG + '&level=' + (BlocklyGames.LEVEL + 1); 
    } else if(getLevelStorage().length == BlocklyGames.MAX_LEVEL) {
        createDialog({
            titulo: "¡¡FELICITACIONES!! ",
            text: "¡Enhorabuena! ¡Has conseguido recuperar los engranajes perdidos dentro del laboratorio de EDI! ",
            src:"img/edi_feliz.png"
        });
    }else{
        for(var i = 0; i < BlocklyGames.MAX_LEVEL ; i++){
            if(!checkLevelStorage(i+1)){
                window.location = window.location.protocol + '//' +
                    window.location.host + window.location.pathname +
                    '?lang=' + BlocklyGames.LANG + '&level=' + (i + 1);
                break;
            }
        }
    }
};

Maze.init = function () {
    Maze.events();
    Maze.drawMap();
    loadBlockly();
    BlocklyGames.workspace.loadAudio_(
        ['media/win.mp3',
         'media/win.ogg'], 'win');
    BlocklyGames.workspace.loadAudio_(
        ['media/fail.mp3',
         'media/fail.ogg'], 'fail');

};

Maze.events = function () {
  $("#RunButton").on('click',Maze.runButtonClick);
  $("#ResetButton").on('click',Maze.resetButtonClick);
  $("#audioOn").on('click',function () {
        var audio = document.getElementById("bg-audio");
        audio.pause();
      $(this).css('display','none');
      $("#audioOff").css('display','inline-block');
  });
  $("#audioOff").on('click',function () {
      var audio = document.getElementById("bg-audio");
      audio.play();
      $(this).css('display','none');
      $("#audioOn").css('display','inline-block');
  });    
  
  $("#return-window").on('click',function () {
      window.location = "../../index.html"
  });

   $("#btndesafio").on('click',function(){
       BlocklyInterface.nextLevel(-1); // La funcion le suma 1 al nivel ingresado
   });
};

Maze.drawMap = function () {
    var svg = document.getElementById("canvas");
    var square = document.createElementNS(Blockly.SVG_NS, 'rect');

    svg.setAttribute('width', Maze.width);
    svg.setAttribute('height', Maze.height);
    square.setAttribute('width', Maze.width);
    square.setAttribute('height', Maze.height);
    square.setAttribute('fill', '#F1EEE7');
    square.setAttribute('stroke-width', 1);
    square.setAttribute('stroke', '#CCB');
    
    svg.appendChild(square);

    var tile = document.createElementNS(Blockly.SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        Maze.skins.background);
    tile.setAttribute('height', Maze.height);
    tile.setAttribute('width', Maze.width);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    
    svg.appendChild(tile);

    var normalize = function(x, y) {
        if (x < 0 || x >= Maze.cols || y < 0 || y >= Maze.rows) {
            return '0';
        }
        return (Maze.mapa[y][x] == Maze.typeSquare.muro) ? '0' : '1';
    };

    var tileId = 0;
    for (var y = 0; y < Maze.rows; y++) {
        for (var x = 0; x < Maze.cols; x++) {

            var tile = normalize(x, y) +
                normalize(x, y - 1) +  // North.
                normalize(x + 1, y) +  // West.
                normalize(x, y + 1) +  // South.
                normalize(x - 1, y);   // East.

            // Draw the tile.
            if (!Maze.tile_SHAPES[tile]) {
                // Empty square.  Use null0 for large areas, with null1-4 for borders.
                // Add some randomness to avoid large empty spaces.
                if (tile == '00000' && Math.random() > 0.3) {
                    tile = 'null0';
                } else {
                    tile = 'null' + Math.floor(1 + Math.random() * 4);
                }
            }
            //console.log("fila: "+y+" columna: "+x+" tile: "+tile);

            var left = Maze.tile_SHAPES[tile][0];
            var top = Maze.tile_SHAPES[tile][1];

            var tileClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
            tileClip.setAttribute('id', 'tileClipPath' + tileId);

            var clipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
            clipRect.setAttribute('width', Maze.cuadro);
            clipRect.setAttribute('height', Maze.cuadro);

            clipRect.setAttribute('x', x * Maze.cuadro);
            clipRect.setAttribute('y', y * Maze.cuadro);

            tileClip.appendChild(clipRect);
            svg.appendChild(tileClip);

            var tile = document.createElementNS(Blockly.SVG_NS, 'image');
            tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                Maze.skins.tiles);
            // Position the tile sprite relative to the clipRect.
            tile.setAttribute('height', Maze.cuadro * 4);
            tile.setAttribute('width', Maze.cuadro * 5);
            tile.setAttribute('clip-path', 'url(#tileClipPath' + tileId + ')');
            tile.setAttribute('x', (x - left) * Maze.cuadro);
            tile.setAttribute('y', (y - top) * Maze.cuadro);
            svg.appendChild(tile);
            tileId++;


        }
    }

    // Add finish marker.
    var finishMarker = document.createElementNS(Blockly.SVG_NS, 'image');
    finishMarker.setAttribute('id', 'finish');
    finishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        Maze.skins.marker);
    finishMarker.setAttribute('height', 30);
    finishMarker.setAttribute('width', 30);
    svg.appendChild(finishMarker);

    // Pegman's clipPath element, whose (x, y) is reset by Maze.displayPegman
    var pegmanClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
    pegmanClip.setAttribute('id', 'pegmanClipPath');
    var clipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
    clipRect.setAttribute('id', 'clipRect');
    clipRect.setAttribute('width', Maze.spriteWidth);
    clipRect.setAttribute('height', Maze.spriteHeight);
    pegmanClip.appendChild(clipRect);
    svg.appendChild(pegmanClip);

    // Add Pegman.
    var pegmanIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    pegmanIcon.setAttribute('id', 'pegman');
    pegmanIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        Maze.skins.sprite);
    pegmanIcon.setAttribute('height', Maze.spriteHeight);
    pegmanIcon.setAttribute('width', Maze.spriteWidth * 21); // 49 * 21 = 1029
    pegmanIcon.setAttribute('clip-path', 'url(#pegmanClipPath)');
    svg.appendChild(pegmanIcon);

    for (var y = 0; y < Maze.rows; y++) {
        for (var x = 0; x < Maze.cols; x++) {
            if (Maze.mapa[y][x] == Maze.typeSquare.inicio) {
                Maze.start_ = {x: x, y: y};
            } else if (Maze.mapa[y][x] == Maze.typeSquare.finish) {
                Maze.finish_ = {x: x, y: y};
            }
        }
    }
    Maze.reset(true);

};

Maze.reset = function(first) {
    // Kill all tasks.
    for (var x = 0; x < Maze.pidList.length; x++) {
        window.clearTimeout(Maze.pidList[x]);
    }
    Maze.pidList = [];

    // Move Pegman into position.
    Maze.pegmanX = Maze.start_.x;
    Maze.pegmanY = Maze.start_.y;

    if (first) {
        Maze.pegmanD = Maze.startDirection + 1;
        Maze.scheduleFinish(false);
        Maze.pidList.push(setTimeout(function() {
            Maze.stepSpeed = 100;
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4],
                [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 - 4]);
            Maze.pegmanD = Maze.startDirection;
        }, Maze.stepSpeed * 5));
    } else {
        Maze.pegmanD = Maze.startDirection;
        Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4);
    }

    // Move the finish icon into position.
    var finishIcon = document.getElementById('finish');
    finishIcon.setAttribute('x', Maze.cuadro * (Maze.finish_.x + 0.5) -
        finishIcon.getAttribute('width') / 2);
    finishIcon.setAttribute('y', Maze.cuadro * (Maze.finish_.y + 0.6) -
        finishIcon.getAttribute('height'));

    // Make 'look' icon invisible and promote to top.
    var lookIcon = document.getElementById('look');
    lookIcon.style.display = 'none';
    lookIcon.parentNode.appendChild(lookIcon);
    var paths = lookIcon.getElementsByTagName('path');
    for (var i = 0, path; path = paths[i]; i++) {
        path.setAttribute('stroke', Maze.skins.look);
    }
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Maze.runButtonClick = function(e) {
    // Prevent double-clicks or double-taps.
    if (BlocklyInterface.eventSpam(e)) {
        return;
    }
    if(checkBlockAlone()){ // Se quequea que todos los bloques deben estar bajo el bloque "Inicio programa"
        alert("Conecta todos los bloques");
        return;
    }
    var ResetButton = document.getElementById('ResetButton');
    ResetButton.style.display = 'inline';
    document.getElementById('RunButton').style.display = 'none';
    BlocklyGames.workspace.traceOn(true);
    Maze.reset(false);
    Maze.execute();
};

/**
 * Click the reset button.  Reset the maze.
 * @param {!Event} e Mouse or touch event.
 */
Maze.resetButtonClick = function(e) {
    // Prevent double-clicks or double-taps.
    if (BlocklyInterface.eventSpam(e)) {
        return;
    }
    var runButton = document.getElementById('RunButton');
    runButton.style.display = 'inline';
    document.getElementById('ResetButton').style.display = 'none';

    BlocklyGames.workspace.traceOn(false);
    Maze.reset(false);
    //Maze.levelHelp();
};

/**
 * Inject the Maze API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
Maze.initInterpreter = function(interpreter, scope) {
    // API
    var wrapper;
    wrapper = function(id) {
        Maze.move(0, id.toString());
    };
    interpreter.setProperty(scope, 'moveForward',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(id) {
        Maze.move(2, id.toString());
    };
    interpreter.setProperty(scope, 'moveBackward',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        Maze.turn(0, id.toString());
    };
    interpreter.setProperty(scope, 'turnLeft',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        Maze.turn(1, id.toString());
    };
    interpreter.setProperty(scope, 'turnRight',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        return interpreter.createPrimitive(Maze.isPath(0, id.toString()));
    };
    interpreter.setProperty(scope, 'isPathForward',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        return interpreter.createPrimitive(Maze.isPath(1, id.toString()));
    };
    interpreter.setProperty(scope, 'isPathRight',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        return interpreter.createPrimitive(Maze.isPath(2, id.toString()));
    };
    interpreter.setProperty(scope, 'isPathBackward',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        return interpreter.createPrimitive(Maze.isPath(3, id.toString()));
    };
    interpreter.setProperty(scope, 'isPathLeft',
        interpreter.createNativeFunction(wrapper));
    wrapper = function() {
        return interpreter.createPrimitive(Maze.notDone());
    };
    interpreter.setProperty(scope, 'notDone',
        interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Maze.execute = function() {
    if (!('Interpreter' in window)) {
        // Interpreter lazy loads and hasn't arrived yet.  Try again later.
        setTimeout(Maze.execute, 250);
        return;
    }

    Maze.log = [];
    
    var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
    Maze.result = Maze.ResultType.UNSET;
    var interpreter = new Interpreter(code,Maze.initInterpreter);
    // Try running the user's code.  There are four possible outcomes:
    // 1. If pegman reaches the finish [SUCCESS], true is thrown.
    // 2. If the program is terminated due to running too long [TIMEOUT],
    //    false is thrown.
    // 3. If another error occurs [ERROR], that error is thrown.
    // 4. If the program ended normally but without solving the maze [FAILURE],
    //    no error or exception is thrown.
    try {
        var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
        while (interpreter.step()) {
            if (ticks-- == 0) {
                throw Infinity;
            }
        }
        Maze.result = Maze.notDone() ?
            Maze.ResultType.FAILURE : Maze.ResultType.SUCCESS;
    } catch (e) {
        // A boolean is thrown for normal termination.
        // Abnormal termination is a user error.
        console.log(e);
        if (e === Infinity) {
            Maze.result = Maze.ResultType.TIMEOUT;
        } else if (e === false) {
            Maze.result = Maze.ResultType.ERROR;
        } else {
            // Syntax error, can't happen.
            Maze.result = Maze.ResultType.ERROR;
            alert(e);
        }
    }
    // Fast animation if execution is successful.  Slow otherwise.
    if (Maze.result == Maze.ResultType.SUCCESS) {
        Maze.stepSpeed = 100;
        Maze.log.push(['finish', null]);
    } else {
        Maze.stepSpeed = 150;
        Maze.log.push(['fail',null]);
    }

    // Maze.log now contains a transcript of all the user's actions.
    // Reset the maze and animate the transcript.
    Maze.reset(false);
    Maze.pidList.push(setTimeout(Maze.animate, 100));
};

/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Maze.animate = function() {
    var action = Maze.log.shift();
    if (!action) {
        BlocklyInterface.highlight(null);
        //Maze.levelHelp();
        return;
    }
    BlocklyInterface.highlight(action[1]);
    switch (action[0]) {
        case 'north':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4],
                [Maze.pegmanX, Maze.pegmanY - 1, Maze.pegmanD * 4]);
            Maze.pegmanY--;
            break;
        case 'east':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4],
                [Maze.pegmanX + 1, Maze.pegmanY, Maze.pegmanD * 4]);
            Maze.pegmanX++;
            break;
        case 'south':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4],
                [Maze.pegmanX, Maze.pegmanY + 1, Maze.pegmanD * 4]);
            Maze.pegmanY++;
            break;
        case 'west':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4],
                [Maze.pegmanX - 1, Maze.pegmanY, Maze.pegmanD * 4]);
            Maze.pegmanX--;
            break;
        case 'look_north':
            Maze.scheduleLook(Maze.DirectionType.NORTH);
            break;
        case 'look_east':
            Maze.scheduleLook(Maze.DirectionType.EAST);
            break;
        case 'look_south':
            Maze.scheduleLook(Maze.DirectionType.SOUTH);
            break;
        case 'look_west':
            Maze.scheduleLook(Maze.DirectionType.WEST);
            break;
        case 'fail_forward':
            Maze.scheduleFail(true);
            setTimeout(
                function(){
                    createDialog({
                        titulo:"Fallo!",
                        text: "Nos hemos equivocado, presiona Reiniciar y volvamos a intentar",
                        src:"img/edi_triste.png"
                    });
                },1000);
            break;
        case 'fail_backward':
            Maze.scheduleFail(false);
            setTimeout(
                function(){
                    createDialog({
                    titulo:"Fallo!",
                    text: "Nos hemos equivocado, presiona Reiniciar y volvamos a intentar",
                    src:"img/edi_triste.png"
                    });
                },1000);
            break;
        case 'left':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4],
                [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 - 4]);
            Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD - 1);
            break;
        case 'right':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4],
                [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 + 4]);
            Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD + 1);
            break;
        case 'finish':
            Maze.scheduleFinish(true);
            storageLevel(BlocklyGames.LEVEL);
            //BlocklyInterface.saveToLocalStorage();
            setTimeout(BlocklyInterface.nextLevel, 1000);
            //setTimeout(BlocklyDialogs.congratulations, 1000);
            break;
        case 'fail':
            setTimeout(
                function(){
                    createDialog({
                        titulo:"Un poco mas!",
                        text: "Nos hizo falta un poco mas, presiona Reiniciar e intentemoslo de nuevo",
                        src:"img/edi_triste.png"
                    });
                },800);
            break;
    }

    Maze.pidList.push(setTimeout(Maze.animate, Maze.stepSpeed * 5));
};


/*Display sprite en la correcta posicion y orientacion*/
Maze.displayPegman = function(x, y, d, opt_angle) {
    var pegmanIcon = document.getElementById('pegman');
    pegmanIcon.setAttribute('x',
        x * Maze.cuadro - d * Maze.spriteWidth + 1);
    pegmanIcon.setAttribute('y',
        Maze.cuadro * (y + 0.5) - Maze.spriteWidth/ 2 - 8);
    if (opt_angle) {
        pegmanIcon.setAttribute('transform', 'rotate(' + opt_angle + ', ' +
            (x * Maze.cuadro + Maze.cuadro / 2) + ', ' +
            (y * Maze.cuadro + Maze.cuadro / 2) + ')');
    } else {
        pegmanIcon.setAttribute('transform', 'rotate(0, 0, 0)');
    }

    var clipRect = document.getElementById('clipRect');
    clipRect.setAttribute('x', x * Maze.cuadro + 1);
    clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};


/**
 * Keep the direction within 0-3, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Maze.constrainDirection4 = function(d) {
    d = Math.round(d) % 4;
    if (d < 0) {
        d += 4;
    }
    return d;
};

Maze.constrainDirection16 = function(d) {
    d = Math.round(d) % 16;
    if (d < 0) {
        d += 16;
    }
    return d;
};

// Core functions.

    /**
     * Attempt to move pegman forward or backward.
     * @param {number} direction Direction to move (0 = forward, 2 = backward).
     * @param {string} id ID of block that triggered this action.
     * @throws {true} If the end of the maze is reached.
     * @throws {false} If Pegman collides with a wall.
     */
    Maze.move = function(direction, id) {
    if (!Maze.isPath(direction, null)) {
        Maze.log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
        throw false;
    }
    // If moving backward, flip the effective direction.
    var effectiveDirection = Maze.pegmanD + direction;
    var command;
    switch (Maze.constrainDirection4(effectiveDirection)) {
        case Maze.DirectionType.NORTH:
            Maze.pegmanY--;
            command = 'north';
            break;
        case Maze.DirectionType.EAST:
            Maze.pegmanX++;
            command = 'east';
            break;
        case Maze.DirectionType.SOUTH:
            Maze.pegmanY++;
            command = 'south';
            break;
        case Maze.DirectionType.WEST:
            Maze.pegmanX--;
            command = 'west';
            break;
    }
    Maze.log.push([command, id]);
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
Maze.turn = function(direction, id) {
    if (direction) {
        // Right turn (clockwise).
        Maze.pegmanD++;
        Maze.log.push(['right', id]);
    } else {
        // Left turn (counterclockwise).
        Maze.pegmanD--;
        Maze.log.push(['left', id]);
    }
    Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD);
};

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Maze.move().
 * @return {boolean} True if there is a path.
 */
Maze.isPath = function(direction, id) {
    var effectiveDirection = Maze.pegmanD + direction;
    var square;
    var command;
    switch (Maze.constrainDirection4(effectiveDirection)) {
        case Maze.DirectionType.NORTH:
            square = Maze.mapa[Maze.pegmanY - 1] &&
                Maze.mapa[Maze.pegmanY - 1][Maze.pegmanX];
            command = 'look_north';
            break;
        case Maze.DirectionType.EAST:
            square = Maze.mapa[Maze.pegmanY][Maze.pegmanX + 1];
            command = 'look_east';
            break;
        case Maze.DirectionType.SOUTH:
            square = Maze.mapa[Maze.pegmanY + 1] &&
                Maze.mapa[Maze.pegmanY + 1][Maze.pegmanX];
            command = 'look_south';
            break;
        case Maze.DirectionType.WEST:
            square = Maze.mapa[Maze.pegmanY][Maze.pegmanX - 1];
            command = 'look_west';
            break;
    }
    if (id) {
        Maze.log.push([command, id]);
    }
    return square !== Maze.typeSquare.muro && square !== undefined;
};

/**
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Maze.notDone = function() {
    return Maze.pegmanX != Maze.finish_.x || Maze.pegmanY != Maze.finish_.y;
};

window.addEventListener('load', Maze.init);