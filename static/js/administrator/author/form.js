$(document).ready(function (e) { 
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
        rules: {

            f_name: {
                required: true, 
            },
            l_name: {
                required: true,
            },
            prefixes: {
                required: true,
            }, 

        },
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
     
    $("#form-author").validate({
        ...VALIDATION_SETTINGS, submitHandler: function (form) {
            form.submit(); 
        }
    }); 

    $("select.select2").select2();

})

