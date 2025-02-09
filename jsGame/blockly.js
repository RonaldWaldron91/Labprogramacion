/**
 * Created by USER on 23/05/2016.
 */
 
var loadBlockly  = function () {
    var rtl = BlocklyGames.isRtl();
    var blocklyDiv = document.getElementById('container-blockly');
    var visualization = document.getElementById('container-game');
    var onresize = function(e) {

        var top = visualization.offsetTop;
        blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
        var widthSvg = parseInt(document.getElementById("canvas").getAttribute('width'));
        var leftoffset = (widthSvg + 20) + 'px' ;
        blocklyDiv.style.left = rtl ? '10px' : leftoffset;
        blocklyDiv.style.width = (window.innerWidth - (widthSvg +40)) + 'px';
        $("#blockly").css('top',$("#blockly-bar").height());
        if(BlocklyGames.workspace){

            /*La barra encima del workspace resize*/
            $("#bar-bloques").css('width',BlocklyGames.workspace.flyout_.width_);
            var width = parseInt(blocklyDiv.style.width.replace("px","")) - parseInt($("#bar-bloques").css('width').replace("px","")) -10;
            $("#bar-workspace").css('width',width);

            Blockly.svgResize(BlocklyGames.workspace);// resize el svg workspace

            $("#blockly").css('top',$("#blockly-bar").height());

            // Al cambiar pantalla que el rootblock se ubique donde debe ser
            var block = getrootBlock();
            if(Blockly.getRelativeXY_(block.getSvgRoot()).x < 15){
                block.moveBy(Math.abs(Blockly.getRelativeXY_(block.getSvgRoot()).x) +15,0);
            }
        }

    };
    window.addEventListener('scroll', function() {
        onresize();
        Blockly.fireUiEvent(window, 'resize');
    });
    window.addEventListener('resize', onresize);
    onresize();

    setToolbox(BlocklyGames.LEVEL);
    
    var toolbox = document.getElementById('toolbox');
    BlocklyGames.workspace = Blockly.inject('blockly',
        {
            media: 'media/',
            maxBlocks : Maze.MAX_BLOCKS +1,
            rtl: false,
            scrollbars:true,
            toolbox: toolbox,
            trashcan: true
        }
    );
    
    setrootBlocks();
    var workspaceChanged =  function () {
        var blocks = BlocklyGames.workspace.getAllBlocks();
        $("#blocksUsed-text").text(blocks.length - 1);
        if(blocks.length - 1 >= Maze.MAX_BLOCKS){
            $("#bar-workspace").css('color','#FFBC11');
            $("#warning").css('display','inline');
        }else{
            $("#bar-workspace").css('color','WHITE');
            $("#warning").css('display','none');
        }
    };

    BlocklyGames.workspace.addChangeListener(workspaceChanged);
};

var setToolbox = function (level) {
    var toolbox  = "<xml id='toolbox' style='display: none;'>";
    toolbox +=  "<block type='maze_moveForward'></block>"+
                "<block type='maze_turn'>"+
                    "<field name='DIR'>turnLeft</field>"+
                "</block>"+
                "<block type='maze_turn'>"+
                    "<field name='DIR'>turnRight</field>"+
                "</block>";

    if((level> 3 && level < 7) || level == 9 || level == 0){
        toolbox += "<block type='repeat_to'></block>";
    }
    if(level> 6 || level == 0){
        toolbox += "<block type='maze_forever'></block>"; 
    }
    if(level >= 10 || level == 0){
        toolbox += "<block type='maze_if'><field name='DIR'>isPathLeft</field></block>";
    }
    if(level >= 15 || level == 0){
        toolbox += "<block type='maze_ifElse'></block>";
    }

    toolbox += "</xml>";
    $('body').append(toolbox);
};

var setrootBlocks = function (){
    var inicioBlock = BlocklyGames.workspace.newBlock('inicio');
    inicioBlock.initSvg();
    inicioBlock.moveBy(15,10);
    inicioBlock.render();
    inicioBlock.setDeletable(false);
    
    //Agregar bloques al desafio
    if(BlocklyGames.LEVEL == 0){
        var repeat_hasta = BlocklyGames.workspace.newBlock('maze_forever'); // 'maze_ifElse' maze_if maze_turn maze_moveForward repeat_to
        var repeat_to = BlocklyGames.workspace.newBlock('repeat_to');
        var Else_if_superior  = BlocklyGames.workspace.newBlock('maze_ifElse');
        var Else_if_medio  = BlocklyGames.workspace.newBlock('maze_ifElse');
        var Else_if_inferior = BlocklyGames.workspace.newBlock('maze_ifElse');
        var avanzar_superior = BlocklyGames.workspace.newBlock('maze_moveForward');
        //var avanzar_inferior = BlocklyGames.workspace.newBlock('maze_moveForward');
        var girar_superior = BlocklyGames.workspace.newBlock('maze_turn');
        var girar_medio = BlocklyGames.workspace.newBlock('maze_turn');
        //var girar_inferior = BlocklyGames.workspace.newBlock('maze_turn');
        var blocks = [
                    repeat_hasta,repeat_to,Else_if_superior,Else_if_inferior,
                    Else_if_medio,avanzar_superior,girar_medio,girar_superior
        ];

        /*Inicializar*/
        $.each(blocks,function (index,value) { // Inicilizacion de bloques
            value.initSvg();
            value.render();
            value.setMovable(false);
            value.setDeletable(false);
        });

        /*Conectar*/
        //repeat_to.getInput('DO').connection.connect(girar_inferior.previousConnection);
        Else_if_inferior.getInput('DO').connection.connect(girar_medio.previousConnection);
        Else_if_inferior.getInput('ELSE').connection.connect(repeat_to.previousConnection);
        //Else_if_medio.getInput('DO').connection.connect(avanzar_inferior.previousConnection);
        Else_if_medio.getInput('ELSE').connection.connect(Else_if_inferior.previousConnection);
        girar_superior.nextConnection.connect(avanzar_superior.previousConnection);
        Else_if_superior.getInput('DO').connection.connect(girar_superior.previousConnection);
        Else_if_superior.getInput('ELSE').connection.connect(Else_if_medio.previousConnection);
        repeat_hasta.getInput('DO').connection.connect(Else_if_superior.previousConnection);
        inicioBlock.nextConnection.connect(repeat_hasta.previousConnection);

        /*Set values*/
        repeat_to.setFieldValue(4,'times');
        Else_if_medio.setFieldValue('isPathRight','DIR');
        girar_medio.setFieldValue('turnRight','DIR');
    }
};

var getrootBlock = function () {
    var blocks = BlocklyGames.workspace.getTopBlocks();
    var rootblock = null;
    $.each(blocks , function (index,value) {
        if(value.type == 'inicio'){
            rootblock = value ;
            return;
        }
    });
    return rootblock;
};

var checkBlockAlone = function () {
    var blocks = BlocklyGames.workspace.getTopBlocks();
    var blockAlone= false;
    $.each(blocks , function (index,value) {
         if(value.type != 'inicio' && value.getParent() == null){
             blockAlone = true ;
             return;
         }
    });
    return blockAlone;
};