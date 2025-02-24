// // Define an object
// const myObj = {
//     name: "John",
//     age: 30,
//     job: "Developer",

//     // Method to update name
//     updateName: function(newName) {
//       this.name = newName;
//       return this;
//     },

//     // Method to update age
//     updateAge: function(newAge) {
//       this.age = newAge;
//       return this;
//     },

//     // Method to update job
//     updateJob: function(newJob) {
//       this.job = newJob;
//       return this;
//     }
//   };

//   // Chain method calls
//   myObj.updateName("Peter").updateAge(35).updateJob("Designer");

//   // Print updated object
//   console.log(myObj);

$(document).ready(function (e) {
    const modal_default = $("#modal-default");
    const URL = $("#btn-advance-filter").data('url');
    const search_term = $("#search_term");
    const paginator = $("#paginator");
    const page_details = $("#page_details");

    class AdvanceFilter {
        constructor(modal, url) {
            this._strategies = [];
            this._status = [];
            this._categories = [];
            this._year_pub = "";
            this._modal = modal;
            this._url = url;
            this._current_page = 1;
            this._max_page = 0;
        }

        get strategies() {
            return this._strategies;
        }

        set strategies(val) {
            this._strategies = val;
        }

        get status() {
            return this._status;
        }

        set status(val) {
            this._status = val;
        }

        get categories() {
            return this._categories;
        }

        set categories(val) {
            this._categories = val;
        }

        get year_pub() {
            return this._year_pub;
        }

        set year_pub(val) {
            if (!val) {
                this._year_pub = "";
                return;
            }

            this._year_pub = val;
        }

        get current_page() {
            return this._current_page;
        }

        set current_page(val) {
            this._current_page = val;
        }

        get max_page() {
            return this._max_page;
        }

        set max_page(val) {
            this._max_page = val;
        }

        load_modal_data(data) {

            let _STRATEGIES = this._strategies;
            let _STATUS = this._status;
            let _CATEGORIES = this._categories;
            let _YEAR_PUB = this._year_pub;


            let m = this._modal.modal({ backdrop: 'static' })
                .find(".modal-content")
                .html(data.html_form);

            m.find('select.select2').select2({
                allowClear: true,
                placeholder: "Select a an option",
            });

            m.find('input[type="checkbox"].strategy').each(function () {
                if (_STRATEGIES) {
                    if (_STRATEGIES.includes($(this).attr('name'))) {
                        $(this).prop('checked', true);
                    }
                }
            });

            m.find('input[type="checkbox"].study-status').each(function () {
                if (_STRATEGIES) {
                    if (_STATUS.includes($(this).attr('name'))) {
                        $(this).prop('checked', true);
                    }
                }

            });

            m.find('input[type="checkbox"].categories').each(function () {
                if (_CATEGORIES) {
                    if (_CATEGORIES.includes($(this).attr('name'))) {
                        $(this).prop('checked', true);
                    }
                }
            });

            m.find('select[name="year_published"]').val(_YEAR_PUB).trigger('change');
        }

        clear_data() {

            localStorage.clear();
            this._strategies = [];
            this._status = [];
            this._categories = [];
            this._year_pub = "";
            return this;
        }

        store_data() {
            localStorage.setItem('strategies', JSON.stringify(this._strategies));
            localStorage.setItem('status', JSON.stringify(this._status));
            localStorage.setItem('categories', JSON.stringify(this._categories));
            localStorage.setItem('year_pub', this._year_pub);
            return this;
        }

        load_data() {
            this._strategies = localStorage.getItem('strategies') ?? [];
            this._status = localStorage.getItem('status') ?? [];
            this._categories = localStorage.getItem('categories') ?? [];
            this._year_pub = localStorage.getItem('year_pub') ?? '';
            return this;

        }

        clear_advance_filter() {
            localStorage.clear();
            search_term.val("");
            return this;
        }

        fetch_research_data() {
            let form = new FormData();
            form.append('strategies', this._strategies);
            form.append('status', this._status);
            form.append('categories', this._categories);
            form.append('year_pub', this._year_pub);
            form.append('search_term', search_term.val());
            form.append('current_page', this._current_page);

            $.ajax({
                // headers: {
                //     "X-CSRFToken": getCookie("csrftoken")
                // },
                url: this._url,
                data: form,
                processData: false,
                contentType: false,
                method: 'POST',
                dataType: 'json',
                error: function (jqXHR, textStatus, errorThrown) {

                }
            }).done((data, statusText, xhr) => {

                if (xhr.status === 200) {
                    $("#reseach_list_container").html(data.html_researches);
                    this.current_page = parseInt(data.current_page);
                    this.max_page = parseInt(data.total_pages);

                    let pages = '';

                    let LEFT_BOUNDARY = 5;
                    let RIGHT_BOUNDARY = this.max_page - 4;


                    if (this._max_page > LEFT_BOUNDARY) {
                        if (this.current_page < LEFT_BOUNDARY) {
                            for (let i = 1; i <= LEFT_BOUNDARY; i++) {
                                pages += `<li class="page-item ${i == this._current_page && 'active'}">
                                            <a href="#" class="page-link page" data-page="${i}">${i}</a>
                                    </li>`;
                            }
                            pages += `<li class="page-item disabled">
                                <a class="page-link">...</a>
                            </li>`
                        } else if (((this._current_page) > (LEFT_BOUNDARY - 1)) && ((this._current_page) <= (RIGHT_BOUNDARY))) {

                            pages += `
                                        <li class="page-item">
                                            <a href="#" class="page-link page" data-page="1">1</a>
                                        </li>
                                        <li class="page-item disabled">
                                            <a class="page-link">...</a>
                                        </li>
                                        <li class="page-item">
                                                <a href="#" class="page-link page" data-page="${this._current_page - 1}">${this._current_page - 1}</a>
                                        </li>
                                        <li class="page-item active">
                                                <a href="#" class="page-link page" data-page="${this._current_page}">${this._current_page}</a>
                                        </li>
                                        <li class="page-item">
                                                <a href="#" class="page-link page" data-page="${this._current_page + 1}">${this._current_page + 1}</a>
                                        </li>
                                        <li class="page-item disabled">
                                            <a class="page-link">...</a>
                                        </li> 
                                        `

                        } else if (this.current_page > RIGHT_BOUNDARY) {
                            pages += `  <li class="page-item">
                                            <a href="#" class="page-link page" data-page="1">1</a>
                                        </li>
                                        <li class="page-item disabled">
                                            <a class="page-link">...</a>
                                        </li>`
                            for (let i = RIGHT_BOUNDARY; i < this._max_page; i++) {
                                pages += `<li class="page-item ${i == this._current_page && 'active'}">
                                            <a href="#" class="page-link page" data-page="${i}">${i}</a>
                                    </li>`;
                            }
                        }
                        if (this._max_page > LEFT_BOUNDARY) { 
                            pages += `<li class="page-item ${this.max_page === this._current_page && 'active'}">
                                    <a href="#" class="page-link page" data-page="${this.max_page}">${this.max_page}</a>
                            </li>`;
                        }

                    }else{
                        // NOTE: If max page does not exists the LEFT Boundary
                        for (let i = 1; i <= this._max_page; i++) {
                            pages += `<li class="page-item ${i == this._current_page && 'active'}">
                                        <a href="#" class="page-link page" data-page="${i}">${i}</a>
                                </li>`;
                        }
                    } 

                    const pagination_html = `
                        <li class="page-item ${this._current_page === 1 && 'disabled'}">
                            <a class="page-link prev" href="#" tabindex="-1">&laquo;</a>
                        </li> 
                        ${pages}
                        <li class="page-item ${this._current_page === this._max_page && 'disabled'}">
                            <a class="page-link next" href="">&raquo;</a>
                        </li>
                    `;

                    paginator.html(pagination_html);

                    // NOTE: Adding page details 
                    page_details.html(`
                        <p>
                        Total Records: <b> ${data.total}</b> | Showing <b>${data.current_page}</b> to <b>${data.total_pages}</b> of <b>${data.total}</b> entries.
                        </p>
                    `)
                }
            });

        }

    }

    // NOTE: Initialize

    const advance_filter = new AdvanceFilter(modal_default, URL);
    advance_filter.clear_data().store_data().load_data().fetch_research_data();

    $("#btn-advance-filter").on("click", function (e) {
        $.ajax({
            url: URL,
            method: 'GET',
            dataType: 'json',
            error: function (jqXHR, textStatus, errorThrown) {

            }
        }).done((data) => {
            advance_filter.load_data().load_modal_data(data);
        })

    });


    modal_default.on("click", "#btn-apply", function (e) {
        let strategies = modal_default.find('input[type="checkbox"].strategy:checked').toArray().map((e, i) => $(e).val());
        let status = modal_default.find('input[type="checkbox"].study-status:checked').toArray().map((e, i) => $(e).val());
        let categories = modal_default.find('input[type="checkbox"].categories:checked').toArray().map((e, i) => $(e).val());
        //    let year_pub = modal_default.find('select[name="year_published"]').select2('data');
        let year_pub = modal_default.find('select[name="year_published"] option:selected').val();

        advance_filter.strategies = strategies;
        advance_filter.status = status;
        advance_filter.categories = categories;
        advance_filter.year_pub = year_pub;
        advance_filter.store_data().load_data().fetch_research_data();

        modal_default.modal('hide');

    });



    modal_default.on("click", "#btn-clear-filter", function (e) {
        advance_filter.clear_advance_filter().clear_data().store_data().load_data().fetch_research_data();
    });

    $("#btn-search").on("click", function (e) {
        advance_filter.load_data().fetch_research_data();
    });




    paginator.on('click', "a.page-link.page", function (e) {
        e.preventDefault();
        let c_page = $(this).data('page');
        advance_filter.current_page = c_page;
        advance_filter.load_data().fetch_research_data();

    })

    paginator.on('click', "a.page-link.prev", function (e) {
        e.preventDefault();
        let c_page = advance_filter.current_page;

        if (c_page <= 1) {
            toastr.error("This is the first page")
            return;
        }
        advance_filter.current_page = c_page - 1;
        advance_filter.load_data().fetch_research_data();

    });
    paginator.on('click', "a.page-link.next", function (e) {
        e.preventDefault();
        let c_page = advance_filter.current_page;
        if (c_page >= advance_filter.max_page) {
            toastr.error("This is the last page")
            return;
        }

        advance_filter.current_page = c_page + 1;
        advance_filter.load_data().fetch_research_data();

    });

    $(".notification button.btn-close").on('click', function (e) {
        $(this).parent().fadeOut();
    })


});