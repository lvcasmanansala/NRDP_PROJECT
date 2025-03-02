function toggleCustomInput(selectElement, inputId) {
    var inputField = document.getElementById(inputId);
    if (selectElement.value === 'others') {
        inputField.style.display = 'block';
    } else {
        inputField.style.display = 'none';
        inputField.value = '';  // Clear input if hidden
    }
}

document.addEventListener("DOMContentLoaded", function () {
    var sourceDropdown = document.getElementById("id_source_document");
    var publicationDropdown = document.getElementById("id_publication_type");

    if (sourceDropdown) {
        sourceDropdown.addEventListener("change", function() {
            toggleCustomInput(this, "id_custom_source_document");
        });
    }

    if (publicationDropdown) {
        publicationDropdown.addEventListener("change", function() {
            toggleCustomInput(this, "id_custom_publication_type");
        });
    }
});