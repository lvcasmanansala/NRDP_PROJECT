$(document).ready(function () {
    let table = $("table.table").DataTable({
        'columnDefs': [{
            'targets': [-2, -1],
            'orderable': false
        }],
        "responsive": true,
        "lengthChange": true,
        "autoWidth": false,
        "select": true,
        "info": true,
        "lengthMenu": [
            [5, 10, 25, 50, -1],
            [5, 10, 25, 50, "All"]
        ],

    });


})
