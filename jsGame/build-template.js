/**
 * Created by USER on 23/05/2016.
 */

var templateInit = function () {
    var containerLevels = $("#levels");
    for (var i =0; i < BlocklyGames.MAX_LEVEL ; i++){
        var link = window.location.protocol + '//' +
                   window.location.host + window.location.pathname +
                   '?lang=' + BlocklyGames.LANG + '&level=' + (i+1);

        var divLevel = "<div class = 'optionLevel' data-level = '"+(i+1)+"'><a href='"+link+"'><span></span></a></div>";
        containerLevels.append(divLevel);
        if(checkLevelStorage(i+1)){
            $(".optionLevel[data-level='"+(i+1)+"'] ").children('a').css({
                background:"#FFBC11",
                color:"WHITE"
            });
        }
    }
    $(".optionLevel[data-level='"+BlocklyGames.LEVEL+"'] ").children('a').children('span').text(BlocklyGames.LEVEL);
    $(".optionLevel[data-level!='"+BlocklyGames.LEVEL+"'] ").children('a').css({
        width:'1.0rem',
        height:'1.0rem'
    });
    $("#maxBlocks-text").text(Maze.MAX_BLOCKS);
    showDialogWelcome(BlocklyGames.LEVEL);
};

var showDialogWelcome = function(lvl){
      var level = lvl || BlocklyGames.LEVEL;
      var pathImage = ""; //window.location.protocol + "//"+window.location.host+ "/html/game/lab/";       
    
      switch (level){
          case 0:
              var titulo = "Desafio de Depuración";
              var text = "Ayuda a EDI a corregir y terminar su algoritmo, para así poder llegar a su engranaje";
              var srcImage = pathImage + "img/edi.png";
              break;
          case 1:
              var titulo = "Bienvenido al laboratorio de EDI";
              var text = " A EDI se le han caído sus valiosos engranajes, ¿Aceptas el reto de recogerlos todos?";
              var srcImage = pathImage + "img/edi.png";
              break;
          case 4: // Aparece bloque repeat to
              var titulo = "Lenguaje del Robot";
              var text = "Ahora, aprende a usar el bloque repetir para no gastar tantos bloques.";
              var srcImage = pathImage + "img/times.png";
              break;
          case 5:
              var titulo = "Tip";
              var text = "Recuerda que el bloque de repetir también es una acción.";
              var srcImage = pathImage + "img/edi.png";
          case 7: //Aparece bloque while end
              var titulo = "¡Optimicemos aún más!";
              var text = "Con este nuevo bloque se repetirán las acciones hasta llegar a la meta. Ya veremos si logras dominarlo.";
              var srcImage = pathImage + "img/repetirHasta.png";
              break;
          case 10:// Aparece bloque if
              var titulo = "Las ventajas de ser un Robot";
              var text = "Este nuevo bloque hará que las acciones de su interior se realicen únicamente cuando se cumpla la condición que escoja";
              var srcImage = pathImage + "img/if.png";
              break;
          case 15://Aparece bloque if-else
              var titulo = "¿Y qué tal sino?";
              var text = "¿Y qué tal si quisieras que la acción se realice cuando mis sensores detectan camino… y también cuando no lo detectan? ";
              var srcImage = pathImage + "img/ifElse.png";
              break;
      }

    if(titulo && text && srcImage){
        createDialog({
            titulo:titulo,
            text: text,
            src:srcImage
        });
    }
};

var createDialog = function (obj) {
    var titulo = obj.titulo || "";
    var srcImg = obj.src || pathImage + "img/edi.png";
    var text = obj.text || "";

    var widthModal = parseInt($(".modal-dialog[role='document']").css('width').replace("px",""));
    var widthImg = widthModal/5;
    var widthText = widthModal - widthImg - parseInt($(".modal-body").css('padding-left').replace("px",""))*2
        - parseInt($("#modal-img").parent('div').css('margin-right').replace("px",""))*2 - 10;


    $("#modal-img").parent('div').css('width',widthImg);
    $("#modal-text").css('width',widthText);

    $("#myModalLabel").text(titulo);
    $("#modal-img").attr('src',srcImg);
    $("#modal-text").children('p').text(text);

    $('#myModal').modal('show');
};

$(window).load(templateInit);