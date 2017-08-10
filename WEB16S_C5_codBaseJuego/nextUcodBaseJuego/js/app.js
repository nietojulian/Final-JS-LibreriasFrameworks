var JuegoDulces;
JuegoDulces = (function () {
    var Reloj;
    var TiempoRestante = 0;
    var gameInit = false;

    //Inicializar
    var initialize = function (tiempoJugado)
    {
        gameInit = false;
        $("#panel-wrapper").hide();
        $("[class^='col']").empty();
        cargarDulces();
        reiniciarPuntaje(tiempoJugado);
        if (typeof(Reloj) == 'number')
        {
            clearInterval(Reloj);
        }
        TiempoRestante = tiempoJugado;
        Reloj = setInterval(controlTiempo, 1000);
        animarTitulo();
        $("#panel-wrapper").show();
        gameInit = true;
    };

    //Puntuacion
    var gameOver = function ()
    {
        $(".panel-tablero").fadeOut(500, function ()
        {
            $(".panel-score").css("width", "100%");
            $("#gameOverTitle").fadeIn(1000);
        });
        clearInterval(Reloj);
        $(".main-titulo").stop();
        $(".main-titulo").css("color","#DCFF0E");
    };

    //Cambiar el color del titulo
    function animarTitulo()
    {
        $(".main-titulo")
            .animate({color:"white"},100).delay(300)
            .animate({color:"#DCFF0E"},100).delay(800)
            .animate({color:"#white"},100,function ()
            {
                animarTitulo()
            })
    }

    //Puntuacion
    function mostrarPuntuacion(points)
    {
        $("#score-text").data("value",$("#score-text").data("value")+points);
        $("#score-text").html($("#score-text").data("value"));
    }

    //Movimientos
    function setPlayedCount()
    {
        $("#movimientos-text").data("value",$("#movimientos-text").data("value")+1);
        $("#movimientos-text").html($("#movimientos-text").data("value"));
    }


    //Controlar tiempo
    function controlTiempo()
    {
        TiempoRestante -= 1;
        $('#timer').html(FormatoTiempo(TiempoRestante));
        if (TiempoRestante == 0)
        {
            gameOver();
        }
    }

    //Formatear tiempo
    function FormatoTiempo(tiempo)
    {
        var Minutos = (Math.floor(tiempo / 60)).toFixed(0);
        var Segundos = (((tiempo / 60) - Math.floor(tiempo / 60)) * 60).toFixed(0);
        return (Minutos.length > 1 ? "" : "0") + Minutos + ":" + ( Segundos.length > 1 ? "" : "0" ) + Segundos;
    }

    //Reiniciar puntaje
    function reiniciarPuntaje(tiempo) {

        $('#timer').html(FormatoTiempo(tiempo));
        $("#score-text").data("value",0);
        $('#score-text').html("0");
        $("#movimientos-text").data("value",0);
        $("#movimientos-text").html("0");
        $('#gameOverTitle').hide();
        $('.panel-score').css("width", "25%");
    }

    //Cargar dulces
    function cargarDulces()
    {
        $("[class^='col']").each(
            function (Columnas)
            {
                let DulcesCargados = ($(this).find(".candy").size());
                for (let var_row=(DulcesCargados+1); var_row <= 7; var_row++)
                {
                     let candy = CargaDulce((Math.floor(Math.random() * (5 - 1)) + 1), var_row, (Columnas + 1));
                     $(this).prepend(candy);
                     candy.addClass("newCandy");
                }
                $(this).find("div").each(
                    function (i)
                    {
                        $(this).data("row",(i+1));
                    }
                );
            }
        );
        if (gameInit == false)
        {
            if (tetrisDulce())
            {
                 $(".candyAutoplay").remove();
                 cargarDulces()
            }
         }
         else
         {
            if ($(".newCandy").size() > 0)
                {
                    $(".newCandy").animate({top:-500},0).animate({top:0},"slow");
                    $(".newCandy").promise().done(
                        function ()
                        {
                            if (tetrisDulce())
                            {
                                $(".candyAutoplay").fadeTo(300,0).fadeTo(300,1).fadeTo(300,0).fadeTo(300,1).hide(300);
                                $(".candyAutoplay").promise().done(
                                function ()
                                {
                                    $(".candyAutoplay").remove();
                                    cargarDulces();
                                });
                            }
                        });
                }
         }
         $(".newCandy").removeClass("newCandy");
    }

    //Carga de dulces
    function CargaDulce(typeOfCandy, row, column) {
        let candy = $("<div class='candy candy" + typeOfCandy + "'></div>");
        candy.data({"column":column,"row":row,"typeOfCandy":typeOfCandy});
        arrastraSuelta(candy);
        return candy;
    }

    //Tetris automatico de dulces
    function tetrisDulce()
    {
        $(".candy").each(
        function ()
        {
            dulcePareja(this,"candyAutoplay");
        });
        let candiesMatched = $(".candyAutoplay").size();
        if (candiesMatched>0)
        {
            //SUMA LOS PUNTOS DE LA AUTO JUGADA
            mostrarPuntuacion(candiesMatched*100);
            return true;
        }
        else
        {
            return false;
        }
    }

    // Arrastrar y Soltar
    function arrastraSuelta(candy)
    {
        candy.draggable(
            {
                revert: "invalid",
                containment: "#panel-wrapper",
                scroll: false
            });
        candy.droppable();
        candy.droppable("disable");
        candy.on("mousedown", areaMovimientos);
    }

    //Area de movimientos
    function areaMovimientos()
    {
        $(".candy").droppable("option", "disabled", true);
        $(".candy").removeClass("CandySelect");
        $(this).addClass("CandySelect");
        var column = $(this).data("column");
        var row = $(this).data("row");
        soltarDulce($('.col-' + (column + 1)).find('div').eq(row-1));
        soltarDulce($('.col-' + (column - 1)).find('div').eq(row-1));
        soltarDulce($('.col-' + column).find('div').eq((row - 2<0?10:(row -2))));
        soltarDulce($('.col-' + column).find('div').eq(row));
    }



    //Volver a la posicion
    function volverPosision(pos) {

        if (pos=="left")
        {
            return {"left":"-166px","top":"0"}
        }
        if (pos=="right")
        {
            return {"left":"166px","top":"0"}
        }
        if (pos=="up")
        {
            return {"left":"0","top":"-96px"}
        }
        if (pos=="down"){
            return {"left":"0","top":"96px"}
        }
    }


    return {
        init: initialize,
        gameOver: gameOver
    }
})
();
$(document).ready(function ()
{
    $('.btn-reinicio').click(function ()
    {
        JuegoDulces.init(120);
        $(this).text('Reiniciar');
    });
});
