$(document).ready(function () {
    'use strict'

    const VALIDATION_SETTINGS = {
        ignore: [], // ignore NOTHING specially on bootstrap tabs
        submitHandler: function (form) {

        },
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                toastr.error("There is an error on your form!")
            }
        },
        // rules: {

        //     f_name: {
        //         required: true, 
        //     },
        //     l_name: {
        //         required: true,
        //     },
        //     prefixes: {
        //         required: true,
        //     }, 

        // },
        // messages: {

        //     name: {
        //         required: "Please provide a first name",
        //         minlength: "Your first name must be at least 5 characters long"
        //     },

        // },
        errorElement: 'span',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        }
    };

    function resetRecaptcha() {
        grecaptcha.reset();
    }
    $('#modal-default').on('shown.bs.modal', function () {
        grecaptcha.render('my-recaptcha', {
          'sitekey' : '6Le2U-YkAAAAAFOIzGEVI8sDo40yZ90H0TBdDd1W'
        });
      });
    $("#btn-report-error").on('click', function (e) {
        let url = $(this).data('url');
        let button = $(this);

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
        }).done((data) => {
            $("#modal-default")
                .modal({ backdrop: 'static' })
                .find(".modal-content")
                .html(data.html_form)
                .find("#form-report-error")
                .validate({
                    ...VALIDATION_SETTINGS, submitHandler: (form) => {
                        $.ajax({
                            headers: {
                                "X-CSRFToken": getCookie("csrftoken")
                            },
                            url: url,
                            type: "POST",
                            data: $(form).serialize(),
                            dataType: 'json',
                            beforeSend: (data) => {
                                button.prop('disabled', true);
                            },
                            success: (data) => {

                            },
                            error: (data) => {
                                toastr.error("Incomplete data/reCAPTCHA/Error upon saving your data!", "Form Validation Error!")
                            },
                            complete: (data) => {
                                button.prop('disabled', false);

                            }
                        }).done((data, statusText, xhr) => {
                            if (xhr.status === 200) {
                                Swal.fire(
                                    'Thank you',
                                    'Your report has been submitted successfully and will be reviewed by our personnel',
                                    'success'
                                )
                                $("#modal-default").modal('hide');
                            }
                        });
                    }
                }); 
        })
    });


    $("#modal-default").on("click", "button#btn-submit", function (e) {
        $(this).closest("#modal-default").find("#form-report-error").submit();
    });


    $("#btn-full-text-dl").on('click', function (e) {
        let url = $(this).data("url");
        if (!url){
            Swal.fire(
                'Sorry',
                'The full-text version is not yet available on this research.',
                'error'
            )

            return;
        }

        window.open(url, "_blank");
    })




})