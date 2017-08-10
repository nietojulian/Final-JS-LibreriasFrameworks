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

    //Soltar dulce
    function soltarDulce(dulce)
    {
        dulce.droppable(
            {
                disabled: false,
                accept: ".CandySelect",
                drop: function (event, ui)
                {
                    var Dulce1 = CargaDulce(
                        ui.draggable.data("typeOfCandy"),
                        $(this).data("row"),
                        $(this).data("column")
                    );
                    var movimientoDulce = obenerMovimientoDulce(ui.draggable);
                    Dulce1.insertAfter(this);
                    var Dulce2 = CargaDulce(
                        $(this).data("typeOfCandy"),
                        ui.draggable.data("row"),
                        ui.draggable.data("column")
                    );
                    Dulce2.css({"top": ui.draggable.css("top"), "left": ui.draggable.css("left")});
                    Dulce2.insertAfter(ui.draggable);
                    Dulce2.animate({"top": 0, "left": 0}, "fast");
                    $(this).detach();
                    $(ui.draggable).detach();
                    var parejaDulce1 = dulcePareja(Dulce1,"dulceEmparejado");
                    var parejaDulce2 = dulcePareja(Dulce2,"dulceEmparejado");
                    if (parejaDulce1.valid || parejaDulce2.valid)
                    {
                        setPlayedCount();
                        mostrarPuntuacion(parejaDulce1.points + parejaDulce2.points);
                        $(Dulce2).promise().done(function() {

                            $(".dulceEmparejado").fadeTo(300,0).fadeTo(300,1).fadeTo(300,0).fadeTo(300,1).hide(300);

                            $(".dulceEmparejado").promise().done(function () {
                                $(".dulceEmparejado").remove();
                                cargarDulces();
                            });
                        });
                    }
                    else
                    {
                        $(this).insertAfter(Dulce1);
                        $(ui.draggable).css(volverPosision(movimientoDulce));
                        $(ui.draggable).insertAfter(Dulce2);
                        Dulce1.remove();
                        Dulce2.remove();
                        $(ui.draggable).animate({"top": 0, "left": 0}, 500);
                     }
                }
            });
    }


    //Emparejamiento de dulces
    function dulcePareja(candy,cssSelector){
        let column = $(candy).data("column");
        let row = $(candy).data("row");
        var parejaOK = {"valid":false,"points":0};
        let candyLeft = $(".col-"+(column-1)).find("div").eq(row-1);
        let candyLeftLeft = $(".col-"+(column-2)).find("div").eq(row-1);
        let candyRight = $(".col-"+(column+1)).find("div").eq(row-1);
        let candyRightRight = $(".col-"+(column+2)).find("div").eq(row-1);
        if ($(candy).data("typeOfCandy") == $(candyRight).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyLeft).data("typeOfCandy"))
        {
             $(candy).addClass(cssSelector);
             $(candyRight).addClass(cssSelector);
             $(candyLeft).addClass(cssSelector);
             parejaOK.valid = true;
             parejaOK.points =+ 100;
        }
        if ( $(candy).data("typeOfCandy") == $(candyLeft).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyLeftLeft).data("typeOfCandy"))
        {
            $(candy).addClass(cssSelector);
            $(candyLeft).addClass(cssSelector);
            $(candyLeftLeft).addClass(cssSelector);
             parejaOK.valid = true;
             parejaOK.points =+ 500;
        }
        if ( $(candy).data("typeOfCandy") == $(candyRight).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyRightRight).data("typeOfCandy"))
        {
            $(candy).addClass(cssSelector);
            $(candyRight).addClass(cssSelector);
            $(candyRightRight).addClass(cssSelector);
            parejaOK.valid = true;
            parejaOK.points =+ 500;
        }
        let candyBefore = $(".col-"+(column)).find("div").eq((row - 2<0?10:(row -2)));
        let candyBeforeBefore = $(".col-"+(column)).find("div").eq((row - 3<0?10:(row -3)));
        let candyAfter = $(".col-"+(column)).find("div").eq(row);
        let candyAfterAfter = $(".col-"+(column)).find("div").eq(row+1);
        if ($(candy).data("typeOfCandy") == $(candyBefore).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyAfter).data("typeOfCandy"))
        {
            $(candy).addClass(cssSelector);
            $(candyBefore).addClass(cssSelector);
            $(candyAfter).addClass(cssSelector);
            parejaOK.valid = true;
            parejaOK.points =+ 100;
        }
        if ( $(candy).data("typeOfCandy") == $(candyBefore).data("typeOfCandy")    &&   $(candy).data("typeOfCandy") == $(candyBeforeBefore).data("typeOfCandy"))
        {
            $(candy).addClass(cssSelector);
            $(candyBefore).addClass(cssSelector);
            $(candyBeforeBefore).addClass(cssSelector);
            parejaOK.valid = true;
            parejaOK.points =+ 500;
        }
        if ( $(candy).data("typeOfCandy") == $(candyAfter).data("typeOfCandy")   &&   $(candy).data("typeOfCandy") == $(candyAfterAfter).data("typeOfCandy"))
        {
            $(candy).addClass(cssSelector);
            $(candyAfter).addClass(cssSelector);
            $(candyAfterAfter).addClass(cssSelector);
            parejaOK.valid = true;
            parejaOK.points =+ 500;
        }
        return parejaOK;
    }

    //Obtener movimiento del dulce
    function obenerMovimientoDulce (candy)
    {
        let top = parseInt($(candy).css("top"));
        let left = parseInt($(candy).css("left"));
        if (left<-100){return "left";}
        if (left>100){return "right";}
        if (top>40){return "down";}
        if (top<-40){return "up";}
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
