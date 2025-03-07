$(document).ready(function () {

    setTimeout(function () {
        var preloader = $(".preloader");

        if (preloader) {
            preloader.css('height', 0);
            setTimeout(function () {
                preloader.children().hide();
            }, 200);
        }
    }, 500);


    $('[data-toggle="tooltip"]').tooltip()


    $(".select2").select2();

    $('.datemask').inputmask('mm/dd/yyyy', { 'placeholder': 'mm/dd/yyyy' }); 

    $(window).scroll(function() {
        if ($(this).scrollTop()) {
            $("#back-to-top").removeClass('d-none').fadeIn();
        } else {
            $("#back-to-top").fadeOut();
        }
    });

    $("#back-to-top").on('click', function(e){
        e.preventDefault(); 
        $("html, body").animate({scrollTop: 0}, 1000);
    })
})