$(document).ready(function () {
    let table = $("table.table").DataTable({
        "order": [[4, "desc"]], // Adjust this index based on the column where the date is.
        "columnDefs": [
            {
                "targets": [4], // Ensure this targets the date column
                "type": "date"
            },
            {
                "targets": [-2, -1],  // Disable sorting for action buttons
                "orderable": false
            }
        ],
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
});
