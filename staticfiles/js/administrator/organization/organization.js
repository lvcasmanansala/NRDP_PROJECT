$(document).ready(function () {
    // NOTE: https://psgc.gitlab.io/api/
    const _ROOT_URL = 'https://psgc.gitlab.io/api/regions/';
    let _regionSelect = [{}];
    let _provinceSelect = {};
    let _districtSelect = {};
    let _municipalitySelect = {};
    let _subMunicipalitySelect = {};
    let _citySelect = {};
    let _barangaySelect = {};

    // NOTE: Advance table settings ========================================
    let tableManagement = window.tableManagement || {};
    tableManagement.colCount = $("#table_data thead tr:eq(0) th").length;
    tableManagement.pageDetails = ""; // NOTE: Page Details
    tableManagement.filterByDateRange = false; // NOTE: Handles the daterangepicker
    tableManagement.searchDelay = ""; // NOTE: handles the timeout of the delay on search column
    tableManagement.select2Filter = []; // NOTE: contains the select2 filter

    $('#table_data thead tr:eq(1) th').each(function (index) {
        var title = $(this).text();
        let excluded = [1, 2, 3, tableManagement.colCount - 1];
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

        // // NOTE: For Date Range
        if (index === 3) {
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

            // NOTE: apply.daterangepicker: Triggered when the apply button is clicked, or when a predefined range is clicked
            // dateRangePicker.on('apply.daterangepicker', function (ev, picker) {
            //     let selectedDateRange = `${picker.startDate.format('MM/DD/YYYY')} - ${picker.endDate.format('MM/DD/YYYY')}`
            //     $(this).val(selectedDateRange);
            //     dateRange = {
            //         startDate: picker.startDate.format('MM/DD/YYYY'),
            //         endDate: picker.endDate.format('MM/DD/YYYY')
            //     }
            //     table.draw() // NOTE: table.ajax.reload() either
            // })


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
            'targets': [1, 2, -1],
            'orderable': false,
            "searchable": false,
        }],
        // NOTE: the data object must matched from the ajax on the backend when loading
        "columns": [
            { "data": "name", "name": "Name", "title": "Name", "width": "30%" },
            { "data": "website_url", "name": "Website Link", "title": "Website Link", "className": "text-center", "width": "10%" },
            { "data": "address", "name": "Address", "title": "Address" },
            { "data": "date_created", "name": "Date Created", "title": "Date Created", "width": "25%" },
            { "data": "action", "name": "Action", "title": "Action" },
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
    // let dropdown_filter = $("#tblaccounts_wrapper").find("#dropdown_filter").html(`
    //     <div class="input-group">
    //         <select style="width: 90%" id="table-filter-dropdown" class="select2 form-control" multiple="multiple" data-placeholder="Select a Filter" data-dropdown-css-class="select2-purple">

    //         </select>
    //         <div class="input-group-append"  data-toggle="tooltip" data-placement="top" title="Filter">
    //             <span class="input-group-text"><i class="fas fa-filter"></i></span>
    //         </div>
    //     </div>
    // `)
    // dropdown_filter.find('[data-toggle="tooltip"]').tooltip()

    // NOTE: Styling the filter of datatable
    $('.dataTables_filter input').removeClass('form-control-sm');
    $('.dataTables_filter input').attr("placeholder", "Search");



    // NOTE: End of table settings ========================================

    $("button[add-organization]").on('click', function (e) {
        e.preventDefault();


        let url = $(this).data("url");
        $.ajax({
            url: url,
            cache: false,
            type: "GET",
            dataType: 'json',
            beforeSend: () => {
                $("#modal-default").data({ url: url }).modal({ backdrop: 'static', keyboard: false });
            },
            success: (data) => {
                let form = $("#modal-default .modal-content").html(data.html_form);
                data.form = form;
                // .select2({
                //     placeholder: "Please search for Region",
                //     // multiple: true,
                //     allowclear: true,
                //     // tags: [],
                //     // tokenSeparators: ['', ','],
                //     minimumInputLength: 3,
                //     minimumResultsForSearch: 10,
                //     ajax: {
                //         url: 'https://psgc.gitlab.io/api/regions/',
                //         dataType: "json",
                //         type: "GET",
                //         delay: 500,
                //         // data: function (term, page) {
                //         //     // NOTE: GET with parameters for filtering  
                //         //     return {
                //         //         term: term.term,
                //         //         page_limit: 10
                //         //     };
                //         // },
                //         processResults: function (data) {

                //             console.table(data)
                //             if (!(data)) {

                //                 return {
                //                     results: []
                //                 };

                //             }
                //             // let d = JSON.parse(data)
                //             return {
                //                 results: $.map(data, function (item) {
                //                     return {
                //                         text: item.name,
                //                         id: item.code
                //                         // NOTE: you can add custom keys here and pull it using this event
                //                         // data: item
                //                         // $('#mySelect2').on('select2:select', function (e) {
                //                         //     var data = e.params.data;
                //                         //     let z = data.data;
                //                         //     console.log(data);
                //                         // });
                //                     }
                //                 })
                //             };

                //         },
                //         matcher: function matchCustom(params, data) {
                //             // If there are no search terms, return all of the data
                //             if ($.trim(params.term) === '') {
                //                 return data;
                //             }

                //             // Do not display the item if there is no 'text' property
                //             if (typeof data.text === ''{}'') {
                //                 return null;
                //             }

                //             // `params.term` should be the term that is used for searching
                //             // `data.text` is the text that is displayed for the data object
                //             if (data.text.indexOf(params.term) > -1) {
                //                 var modifiedData = $.extend({}, data, true);
                //                 modifiedData.text += ' (matched)';

                //                 // You can return modified objects from here
                //                 // This includes matching the `children` how you want in nested data sets
                //                 return modifiedData;
                //             }

                //             // Return `null` if the term should not be displayed
                //             return null;
                //         }
                //     }
                // })
                // .val(data.status.toLowerCase())
                // .trigger('change');

            },
            complete: (data) => {

            },
            error: (data) => {

            }
        }).done(function () {
            let m = $("#modal-default .modal-content");
            let button = m.find('button[type="submit"]')
            $.ajax({
                url: _ROOT_URL,
                cache: false,
                type: "GET",
                dataType: 'json',
                success: (data) => {
                    _regionSelect = m.find("select[name='region']");
                    _provinceSelect = m.find("select[name='province']");
                    _districtSelect = m.find("select[name='district']");
                    _municipalitySelect = m.find("select[name='municipality']");
                    _cityMunicipalitySelect = m.find("select[name='city_municipality']");
                    _subMunicipalitySelect = m.find("select[name='sub_municipality']");
                    _citySelect = m.find("select[name='city']");
                    _barangaySelect = m.find("select[name='barangay']");
                    let rL = data.map((e, i) => ({
                        id: e.code,
                        text: `${e.regionName} (${e.name})`,
                        secret_data: { code: e.code, name: e.name, regionName: e.regionName },
                    }))


                    // !.val("020000000").trigger('change'); 

                    _regionSelect.prop('disabled', false).select2({
                        placeholder: "Select a region",
                        allowClear: true,
                        data: rL
                    }).on('select2:select', function (e) {
                        var data = e.params.data;
                        _REGION = data.secret_data;
                        button.prop('disabled', true);


                        loadAddressAPI(data, button)
                        // fetch(_ROOT_URL + data.id + '/provinces/')
                        // .then((response) => response.json())
                        // .then((data) => {
                        //     _provinceSelect.empty().val(null).trigger('change').select2({
                        //         data: data.map((e) => ({ id: e.code, text: e.name }))
                        //     })
                        // });

                    })

                },
            })

        }).done(function (data) {
            saveData(data);
        });
 

    })

    $("#table_data").on('click', '.edit', function (e) {
        e.preventDefault();
        let url = $(this).attr("href");
        $.ajax({
            url: url,
            cache: false,
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
        }).done(function () {
            let m = $("#modal-default .modal-content");
            let button = m.find('button[type="submit"]')
            $.ajax({
                url: _ROOT_URL,
                cache: false,
                type: "GET",
                dataType: 'json',
                success: (data) => {
                    _regionSelect = m.find("select[name='region']");
                    _provinceSelect = m.find("select[name='province']");
                    _districtSelect = m.find("select[name='district']");
                    _municipalitySelect = m.find("select[name='municipality']");
                    _cityMunicipalitySelect = m.find("select[name='city_municipality']");
                    _subMunicipalitySelect = m.find("select[name='sub_municipality']");
                    _citySelect = m.find("select[name='city']");
                    _barangaySelect = m.find("select[name='barangay']");
                    let rL = data.map((e, i) => ({
                        id: e.code,
                        text: `${e.regionName} (${e.name})`,
                        secret_data: { code: e.code, name: e.name, regionName: e.regionName },
                    }))


                    // !.val("020000000").trigger('change'); 


                    let x = _regionSelect.prop('disabled', false).select2({
                        placeholder: "Select a region",
                        allowClear: true,
                        data: rL
                    }).on('select2:select', function (e) {
                        var data = e.params.data;
                        _REGION = data.secret_data;
                        button.prop('disabled', true);


                        loadAddressAPI(data, button)

                    })
                    loadAddressAPI(x.select2('data')[0], button, false)
                },
            })
        }).done(function (data) {
            saveData(data);
        });
    })

    $("#table_data").on('click', '.delete', function (e){
        let url = $(this).data("url");
        
        Swal.fire({
            title: 'Are you sure?',
            html: `Do you want to <b class="text-success">Delete</b> this <b class="text-danger">Organization?</b> 
            <b class="text-warning"> Warning!</b> All of the data under this <b>organization</b> will also be <b class="text-uppercase">deleted</b>, 
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
                                'Data been successfully deleted!',
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

    function loadAddressAPI(data, button, clear = true) {
        Promise.all([
            fetch(_ROOT_URL + data.id + '/provinces/').then((response) => response.json()),
            fetch(_ROOT_URL + data.id + '/districts/').then((response) => response.json()),
            fetch(_ROOT_URL + data.id + '/cities/').then((response) => response.json()),
            fetch(_ROOT_URL + data.id + '/municipalities/').then((response) => response.json()),
            fetch(_ROOT_URL + data.id + '/cities-municipalities/').then((response) => response.json()),
            fetch(_ROOT_URL + data.id + '/sub-municipalities/').then((response) => response.json()),
            fetch(_ROOT_URL + data.id + '/barangays/').then((response) => response.json()),
        ]).then(([
            province_response_data,
            district_response_data,
            city_response_data,
            municipality_response_data,
            cities_municipalities_response_data,
            sub_municipality_response_data,
            barangay_response_data,
        ]) => {

            if (clear) {
                _provinceSelect.empty().val(null).trigger('change').select2({
                    placeholder: "Select a province",
                    allowClear: true,
                    data: province_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);

                _districtSelect.empty().val(null).trigger('change').select2({
                    placeholder: "Select a district",
                    allowClear: true,
                    data: district_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _citySelect.empty().val(null).trigger('change').select2({
                    placeholder: "Select a city",
                    allowClear: true,
                    data: city_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _municipalitySelect.empty().val(null).trigger('change').select2({
                    placeholder: "Select a municipality",
                    allowClear: true,
                    data: municipality_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _cityMunicipalitySelect.empty().val(null).trigger('change').select2({
                    placeholder: "Select a city municipality",
                    allowClear: true,
                    data: cities_municipalities_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _subMunicipalitySelect.empty().val(null).trigger('change').select2({
                    placeholder: "Select a sub municipality",
                    allowClear: true,
                    data: sub_municipality_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _barangaySelect.empty().val(null).trigger('change').select2({
                    placeholder: "Select a barangary",
                    allowClear: true,
                    data: barangay_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);
            } else {

                _provinceSelect.trigger('change').select2({
                    placeholder: "Select a province",
                    allowClear: true,
                    data: province_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);

                _districtSelect.trigger('change').select2({
                    placeholder: "Select a district",
                    allowClear: true,
                    data: district_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _citySelect.trigger('change').select2({
                    placeholder: "Select a city",
                    allowClear: true,
                    data: city_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _municipalitySelect.trigger('change').select2({
                    placeholder: "Select a municipality",
                    allowClear: true,
                    data: municipality_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _cityMunicipalitySelect.trigger('change').select2({
                    placeholder: "Select a city municipality",
                    allowClear: true,
                    data: cities_municipalities_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _subMunicipalitySelect.trigger('change').select2({
                    placeholder: "Select a sub municipality",
                    allowClear: true,
                    data: sub_municipality_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);


                _barangaySelect.trigger('change').select2({
                    placeholder: "Select a barangary",
                    allowClear: true,
                    data: barangay_response_data.map((e) => ({ id: e.code, text: e.name, secret_data: { code: e.code, name: e.name }, }))
                }).prop('disabled', false);

            }
            button.prop('disabled', false);

        }).catch((err) => console.error(err))
    }

    function saveData(data) {


        let url = data.form.find('form').data('url');
        let name = data.form.find('form').find('input[name="name"]');
        let website_url = data.form.find('form').find('input[name="website_url"]');
        let additional_address = data.form.find('form').find('textarea[name="additional_address"]');
        let button = data.form.find('form').find('button[type="submit"]');
        data.form.find('form').validate({
            ignore: [], // ? ignore NOTHING specially on bootstrap tabs
            submitHandler: function (form) {
                let formData = new FormData();
                formData.append('name', name.val());
                formData.append('website_url', website_url.val());
                formData.append('additional_address', additional_address.val());
                formData.append('_regionSelect', JSON.stringify(_regionSelect.select2('data')[0].secret_data));
                formData.append('_provinceSelect', _provinceSelect.select2('data').length ? JSON.stringify(_provinceSelect.select2('data')[0].secret_data) : '{}');
                formData.append('_districtSelect', _districtSelect.select2('data').length ? JSON.stringify(_districtSelect.select2('data')[0].secret_data) : '{}');
                formData.append('_municipalitySelect', _municipalitySelect.select2('data').length ? JSON.stringify(_municipalitySelect.select2('data')[0].secret_data) : '{}');
                formData.append('_cityMunicipalitySelect', _cityMunicipalitySelect.select2('data').length ? JSON.stringify(_cityMunicipalitySelect.select2('data')[0].secret_data) : '{}');
                formData.append('_subMunicipalitySelect', _subMunicipalitySelect.select2('data').length ? JSON.stringify(_subMunicipalitySelect.select2('data')[0].secret_data) : '{}');
                formData.append('_citySelect', _citySelect.select2('data').length ? JSON.stringify(_citySelect.select2('data')[0].secret_data) : '{}');
                formData.append('_barangaySelect', _barangaySelect.select2('data').length ? JSON.stringify(_barangaySelect.select2('data')[0].secret_data) : '{}');


                // Display the key/value pairs
                // for (var pair of formData.entries()) {
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
                    data: formData,
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
                            data.errors.forEach((currentValue, index) => {
                                toastr.error(`${currentValue.value}`, `${currentValue.field}`)
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
                name: {
                    required: true,
                    minlength: 5
                },
                website_url: {
                    required: true,
                    minlength: 5
                },
                region: {
                    required: true,
                },
                additional_address: {
                    maxlength: 255
                }
            },

            messages: {
                name: {
                    required: "Please provide a Organization/Agency/Industry Name",
                    minlength: "Your last name must be at least 5 characters long"
                },
                website_url: {
                    required: "Please provide a Official Website URL",
                    minlength: "Your last name must be at least 5 characters long"
                },
                region: {
                    required: "Please Select a Region",
                },
                additional_address: {
                    maxlength: "Max character length is 255 only",
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
    $(".modal").on("hidden.bs.modal", function () {
        $("#modal-default").find(".modal-content").off("select2:select").html("");
    });

});