/**
 * Created by USER on 31/05/2016.
 */

var assignTooltips = function () {
    setTooltip('#return-window','Regresar a Pygmalion Blocks','bottom');
};


var setTooltip = function (id,msg,position){
    var tooltip = {
        container:'body',
        title:"tooltip",
        animation:true,
        placement:'bottom',
        trigger:'hover'
    };

    if(id != undefined){
        if(msg != undefined){
            tooltip.title = msg;
        }
        if(position != undefined){
            tooltip.placement = position
        }

        $(id).tooltip(tooltip);
    }

};

$(window).load(assignTooltips);