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

            title: {
                required: true, 
            },
            URL: {
                required: true,
            },
            author: {
                required: true,
            },
            abstract_text: {
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
    $('input[name="pub_date"].drp').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        minYear: 1901,
        maxYear: parseInt(moment().format('YYYY'), 10),
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    }, function (start, end, label) {
        // var years = moment().diff(start, 'years');
        // alert("You are " + years + " years old!");
    });
    $('input[name="pub_date"].drp').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY'));
    });
  
    $('input[name="pub_date"]drp').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    }); 
    $("#form-research").validate({
        ...VALIDATION_SETTINGS, submitHandler: function (form) {
            form.submit(); 
        }
    }); 

})

