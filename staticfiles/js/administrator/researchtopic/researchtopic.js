$(document).ready(function () {
    // NOTE: Advance table settings ========================================
    let tableManagement = window.tableManagement || {};
    tableManagement.colCount = $("#table_data thead tr:eq(0) th").length;
    tableManagement.pageDetails = ""; // NOTE: Page Details
    tableManagement.filterByDateRange = false; // NOTE: Handles the daterangepicker
    tableManagement.searchDelay = ""; // NOTE: handles the timeout of the delay on search column
    tableManagement.select2Filter = []; // NOTE: contains the select2 filter

    $('#table_data thead tr:eq(1) th').each(function (index) {
        var title = $(this).text();
        let excluded = [2, 3, 4, 5, 6, 7, tableManagement.colCount - 1];
        if (!excluded.includes(index)) {
            let searchInput = `
            <div class="input-group">
                <input type="text" class="form-control column_search" placeholder="Search ${title}" />
                <div class="input-group-append">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                </div>
            </div>
            `
            $(this).html(searchInput);
        }

        // NOTE: For Date Range
        if (index === tableManagement.colCount - 2) {
            let searchInput = `
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">
                    <i class="far fa-calendar-alt"></i>
                    </span>
                </div>
                <input type="text" name="dateRangePicker" class="form-control cdaterangepicker" placeholder="Search Date Range" /> 
                <div class="input-group-append">
                    <span class="input-group-text">
                        <input type="checkbox" data-toggle="tooltip" data-placement="top" title="Toggle daterange filter">
                    </span>
                </div>
            </div>
            `
            // !https://www.daterangepicker.com/
            let columnSearch = $(this).html(searchInput)
            let dateRangePicker = columnSearch.find('input[name="dateRangePicker"].cdaterangepicker')
            dateRangePicker.daterangepicker({
                opens: 'left',
                // autoUpdateInput: false,
                showDropdowns: true,
                // timePicker: true,
                // startDate: '03/05/2005', endDate: '03/06/2005',
                // locale: {
                //     cancelLabel: 'Clear'
                // },
            }, function (start, end, label) {
                if (tableManagement.filterByDateRange) {

                    table.draw()
                }
            });


            // NOTE: Toggle Daterange Filter
            columnSearch.find('input[type="checkbox"]').on("change", function (e) {
                tableManagement.filterByDateRange = $(this).is(':checked') ? true : false;
                table.draw()
            })

        }
    });


    // NOTE: Table Settings
    let table = $("#table_data").DataTable({
        // NOTE: Data from ajax
        ajax: {
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
            // url: $("#tblaccounts").data('url'),
            // method: 'GET',
            method: 'POST',
            data: (d) => {
                let dateRange = $("#table_data").find('.input-group').find('input[name="dateRangePicker"]').data('daterangepicker');
                // let filter_items = $("#tblaccounts_wrapper").find("#dropdown_filter").find(':selected').toArray().map(item => item.text);

                // const initialVal = {};
                // let params = filter_items.reduce((previousValue, currentValue) => {
                //     return { ...previousValue, [currentValue]: currentValue }
                // }, initialVal)

                // ! proper format'["Ford", "BMW", "Fiat"]'; 
                // NOTE: Paging Details
                if (tableManagement.pageDetails) {
                    d = { ...d, ...tableManagement.pageDetails() }
                }

                // NOTE: if checked
                if (tableManagement.filterByDateRange) {
                    d = { ...d, startDate: dateRange.startDate.format('MM/DD/YYYY'), endDate: dateRange.endDate.format('MM/DD/YYYY') }
                }

                // NOTE: Sending the filters
                d.params = JSON.stringify(tableManagement.select2Filter);
                return d
            },
            // ! https://datatables.net/forums/discussion/31313/how-do-i-stop-1447131652166-coming-up-on-every-ajax-request
            // cache: true,
            dataSrc: function (json) {
                //Make your callback here.  
                return json.data;
            },
            // dataFilter: function(data){
            //     var json = jQuery.parseJSON( data );
            //     json.recordsTotal = json.total;
            //     json.recordsFiltered = json.total;
            //     json.data = json.list;
            //     console.log(json)
            //     return JSON.stringify( json ); // return JSON string
            // }
        },
        // NOTE: Call back after loading the data  and renders to the table
        "initComplete": function (settings, json) {
            // NOTE: Remove default button styles
            $("#table_data_wrapper .dt-buttons")
                .find('button')
                .removeClass('btn-secondary')
                .addClass('bg-basic')
                .addClass('text-white');

            // NOTE: DT Search filter 
            $("#table_data_filter input").off();
            $('#table_data_filter input').on('keyup search', function (e) {

                clearTimeout(tableManagement.searchDelay)
                tableManagement.searchDelay = setTimeout(() => {
                    table.search(this.value).draw();
                }, 500)
                // if(e.keyCode == 13) {
                //     // oTable.search( this.value ).draw();
                //     alert("SAD")
                // }
            });
            $('[data-toggle="tooltip"]').tooltip()
            toastr.info("You data has been successfully loaded!")
        },
        // NOTE: https://datatables.net/reference/option/columnDefs
        orderCellsTop: true,
        'columnDefs': [{
            'targets': [2, 6, -1],
            'orderable': false,
            "searchable": false,
        }],
        // NOTE: the data object must matched from the ajax on the backend when loading
        "columns": [
            { "data": "organization", "name": "organization", "title": "Orgranization/Agency/Institution", "width": "10%" },
            { "data": "contributor", "name": "contributor", "title": "Contributor", "className": "text-center", "width": "10%" },
            { "data": "attachments", "name": "attachments", "title": "Attachments", "className": "text-center", "width": "5%" },
            { "data": "title", "name": "title", "title": "Title", "width": "15%" },
            { "data": "study_area", "name": "study_area", "title": "Study Area", "className": "text-center", "width": "10%" },
            { "data": "publication_date", "name": "publication_date", "title": "Publication Date", "className": "text-center", "width": "10%" },
            { "data": "remarks", "name": "remarks", "title": "Remarks", "width": "10%" },
            { "data": "date_created", "name": "date_created", "title": "Date Created", "className": "text-center", "width": "15%" },
            { "data": "action", "name": "Action", "title": "Action", "width": "5%" },
            //repeat for each of my 20 or so fields
        ],
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false,
        "select": true,
        "info": true,
        // NOTE: https://datatables.net/forums/discussion/41654/how-to-display-a-progress-indicator-for-serverside-processing
        "processing": true,
        "language": {
            processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        "serverSide": true,
        // "deferLoading": 57,
        // "dom": 'Blfrtip',
        // NOTE https://datatables.net/examples/styling/bootstrap5.html
        // NOTE https://datatables.net/examples/basic_init/dom.html
        "dom":
            "<'row'<'col-sm-6'B><'col-sm-3'<'#dropdown_filter'>><'col-sm-3'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-4'i><'col-sm-4 text-center'l><'col-sm-4'p>>",
        "lengthMenu": [
            [5, 10, 25, 50, -1],
            [5, 10, 25, 50, "All"]
        ], // Show all  
        // NOTE: Allows enter key to be triggered on search box
        "search": {
            return: true,
        },

        // "lengthMenu": [10, 25, 50, 75, 100, 250, 500],
        // "iDisplayLength": 15,
        // "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis", "pageLength"],
        "buttons": [
            // 'copy', 'csv', 'excel', 'print', //'pdf',
            // NOTE: Custom button
            {
                text: 'Refresh <i class="fas fa-sync-alt fa-spin"></i>',
                action: function (e, dt, node, config) {
                    // table.ajax.reload()
                    table.draw()
                    toastr.info("Table has been refreshed!")
                }
            },
            // {
            //     extend: 'copyHtml5',
            //     footer: true
            // },
            {
                extend: 'csvHtml5',
                exportOptions: {
                    columns: 'th:not(:last-child)'
                },
                // className: 'btn-primary'
            },
            // Do not include last column for export and inlude the footer with title
            {
                extend: 'excelHtml5',
                messageTop: 'DENR Environment Laboratory Research System',
                messageBottom: null,
                footer: true,
                exportOptions: {
                    columns: 'th:not(:last-child)'
                }
            },
            {
                extend: 'pdfHtml5',
                messageTop: 'DENR Environment Laboratory Research System',
                messageBottom: null,
                orientation: 'landscape',
                pageSize: 'LEGAL',
                footer: true,
                exportOptions: {
                    columns: 'th:not(:last-child)'
                }
            },
            // "print",
            "colvis",
            "pageLength"
        ],

    });

    tableManagement.pageDetails = () => table.page.info();
    table.buttons().container().appendTo('#table_data_wrapper .col-md-6:eq(0)');

    // NOTE: Apply Search 
    $('#table_data thead').on('keyup', ".column_search", function () {
        tableManagement.searchDelay && clearTimeout(tableManagement.searchDelay)
        tableManagement.searchDelay = setTimeout(() => {
            table.column($(this).closest('.input-group').parent().index())
                .search(this.value)
                .draw();
        }, 500)
    });

    // NOTE: Adding select2 and initializing
    let dropdown_filter = $("#table_data_wrapper").find("#dropdown_filter").html(`
      <div class="input-group">
          <select style="width: 90%" id="table-filter-dropdown" class="select2 form-control" multiple="multiple" data-placeholder="Select a Filter" data-dropdown-css-class="select2-info">
          
          </select>
          <div class="input-group-append"  data-toggle="tooltip" data-placement="top" title="Filter">
              <span class="input-group-text"><i class="fas fa-filter"></i></span>
          </div>
      </div>
    `)
    // NOTE: Preloading the filter options using ajax
    $.ajax({
        url: $("#table_data").data('url'),
        dataType: "json",
        type: "GET",
    }).done(function (data) {
        if (data.data.results) {
            let res = data.data.results;
            let opts = res.map(function (e, i) {
                return `
            <optgroup label="${e.text}">
                ${e.children.map((e1, i) => `<option value="${e1.id}">${e1.text}</option>`).join('')
                    } 
            </optgroup>
            `
            }).join('')

            dropdown_filter.find(".select2").select2({
                width: 'resolve', // need to override the changed default
                placeholder: "Select a filter",
                // data: options.results,
                closeOnSelect: false,
                allowClear: true,
                maximumSelectionLength: 4,

            });
            // NOTE: Appending to the Select2
            dropdown_filter.find("#table-filter-dropdown").append($(opts)).trigger('change');

            // NOTE: Events
            dropdown_filter.find(".select2").on('select2:select', function (e) {
                // var data = e.params.data;
                let filters = $('#table-filter-dropdown').select2('data');
                tableManagement.select2Filter = filters.map((e, i) => ({ id: e.id, text: e.text }))
                table.ajax.reload(null, false);
            });
            dropdown_filter.find(".select2").on('select2:unselect', function (e) {
                clearTimeout(tableManagement.searchDelay)
                tableManagement.searchDelay = setTimeout(function () {
                    // var data = e.params.data;
                    let filters = $('#table-filter-dropdown').select2('data');
                    tableManagement.select2Filter = filters.map((e, i) => ({ id: e.id, text: e.text }))
                    table.ajax.reload(null, false);
                }, 500)
            });

        }
    })
    dropdown_filter.find('[data-toggle="tooltip"]').tooltip()

    // NOTE: Styling the filter of datatable
    $('.dataTables_filter input').removeClass('form-control-sm');
    $('.dataTables_filter input').attr("placeholder", "Search");

    // NOTE: End of table settings ========================================

    $("button[add-research]").on('click', function (e) {
        let url = $(this).data("url");
        $.ajax({
            url: url,
            type: "GET",
            dataType: 'json',
            beforeSend: () => {
                $("#modal-default").data({ url: url }).modal({ backdrop: 'static', keyboard: false });
            },
            success: (data) => {
                let form = $("#modal-default .modal-content").html(data.html_form);
                data.form = form;

            },
            complete: (data) => {

            },
            error: (data) => {

            }
        }).done(function (data) {
            bsCustomFileInput.init();
            data.form.find(".select2").select2();
            // NOTE: Datemask dd/mm/yyyy
            // data.form.find('.datetimepicker-input').inputmask('mm/dd/yyyy', { 'placeholder': 'mm/dd/yyyy' })
            data.form.find('[data-mask]').inputmask()
        }).done(function (data) {
            saveData(data);
        })
    })

    $("#table_data").on('click', '.edit', function (e) {
        e.preventDefault();
        let url = $(this).attr("href");
        $.ajax({
            url: url,
            type: "GET",
            dataType: 'json',
            beforeSend: () => {
                $("#modal-default").data({ url: url }).modal({ backdrop: 'static', keyboard: false });
            },
            success: (data) => {
                let form = $("#modal-default .modal-content").html(data.html_form);
                data.form = form;

            },
            complete: (data) => {

            },
            error: (data) => {

            }
        }).done(function (data) {
            bsCustomFileInput.init();
            data.form.find(".select2").select2();
            // NOTE: Telephone / Contact# Mask
            data.form.find('[data-mask]').inputmask();
        }).done(function (data) { 
            saveData(data, false);
        })
    })

    $("#table_data").on('click', '.delete', function (e) {
        let url = $(this).data("url");

        Swal.fire({
            title: 'Are you sure?',
            html: `Do you want to <b class="text-success">Delete</b> this <b class="text-danger">Research?</b> 
            <b class="text-warning"> Warning!</b> All of the details/data under this <b>reseaarch</b> will also be <b class="text-uppercase">deleted</b>, 
            Do you wish to continue?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3C92B3',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    headers: {
                        "X-CSRFToken": getCookie("csrftoken")
                    },
                    url: url,
                    cache: false,
                    type: "POST",
                    dataType: 'json',
                    beforeSend: () => {
                    },
                    success: (data) => {
                        if (data.is_valid) {
                            Swal.fire(
                                'Success!',
                                'Data has been successfully deleted!',
                                'success'
                            )
                            table.draw()

                        } else {
                            toastr.error("There's an error upon deleting this shop details!")
                        }
                    },
                    complete: (data) => {
                    },
                    error: (data) => {

                    }
                });

            }
        })
    })


    $.validator.addMethod('filesize', function (value, element, param) {
        if (value) {
            let filesize = element.files[0].size;
            let mb = ((filesize * 0.001) * 0.001);
            return mb < param ? true : false;
        }
        return true;

    }, "Max file size is 5MB")

    function saveData(data, attachment_required=true) {
        let url = data.form.find('form').data('url');
        data.form.find('form').validate({
            ignore: [], // ? ignore NOTHING specially on bootstrap tabs
            submitHandler: function (form) {
                let cform = new FormData($(form)[0]);
                let button = data.form.find('form').find('button[type="submit"]');
                // Display the key/value pairs
                // for (var pair of cform.entries()) {
                //     console.log(pair[0] + ', ' + pair[1]);
                // }
                $.ajax({
                    headers: {
                        "X-CSRFToken": getCookie("csrftoken")
                    },
                    url: url,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: "POST",
                    // data: $(form).serialize(),
                    data: cform,
                    dataType: 'json',
                    beforeSend: (data) => {
                        button.prop("disabled", true);
                    },
                    success: (data) => {
                        if (data.is_valid) {
                            toastr.success("Successfully Saved!", "Success")
                            $("#modal-default").modal('hide');
                            table.draw()
                        } else {
                            data.error_list.forEach((currentValue, index) => {
                                toastr.error(`${currentValue.error_message}`, `${currentValue.field}`)
                            })
                        }
                    },
                    error: (data) => {
                        toastr.error("There was an error on saving your data.", "Error")
                    },
                    complete: (data) => {
                        button.prop("disabled", false);
                    }
                });

            },
            invalidHandler: function (form, validator) {
                var errors = validator.numberOfInvalids();
                if (errors) {

                    // if (validator.errorList.length > 0) {
                    //   for (x = 0; x < validator.errorList.length; x++) {
                    //     errors += validator.errorList[x].message;
                    //   }
                    // }
                    toastr.error("Please provide the required details in the form", "Incomplete data")
                }
            },

            rules: {
                contributor: {
                    required: true,
                },
                attachment: {
                    required: attachment_required,
                    accept: "application/pdf",
                    // extension: "jpg,jpeg,png",
                    filesize: 35 // <- 5 MB
                },
                title: {
                    required: true,
                },
                study_area: {
                    required: true,
                },
                publication_date: {
                    required: true,
                },


            },

            messages: {
                contributor: {
                    required: "Please provide a Conbributor",
                },
                attachment: {
                    required: "Please provide the attachment file",
                },
                title: {
                    required: "Please provide the research's Title",
                },
                study_area: {
                    required: "Please provide the study area",
                },
                publication_date: {
                    required: "Please provide the publication date",
                },

            },
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
        });
    }
})
