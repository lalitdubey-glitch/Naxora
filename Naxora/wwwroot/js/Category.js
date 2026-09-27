
$(document).ready(function () {

    


    $(document).on("click", ".btn_editCat", function () { 
        $("#btn_AddCat").val("Edit");
        $("h2").text("Edit Category");
        cid = $(this).data('id'); 
        GetCatById(cid)

    })

    $(document).on("click", ".btn_deleteCat", function () {  
        cid = $(this).data('id'); 
        Swal.fire({
            title: "Are You Sure?",
            text: "Do you really want to Delete this Category!?",
            showConfirmButton: true,
            showCancelButton: true, 
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCategory(cid)
            }
        })
    })

    $(document).on("click", ".catStatusChange", function () {  
        id = $(this).data('id');  
        changeStatus(id)
    })


})

function changeStatus(cid) {
    $.ajax({
        url: "/Products/changeCategoryStatus",
        type: "post",
        data: { cid: cid},
        success: function (res) { 
            if (res.success && res.ms === "statusChanged") {
                Swal.fire("Success", "Status Changed", "success");
                GetAllCategoryForTable()
            }
            else {
                Swal.fire("Info", res.ms, "info");
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }
    })
}

function deleteCategory(cid) { 
    $.ajax({
        url: "/Products/deleteCategory",
        type: "post",
        data: { cid: cid }, 
        success: function (res) { 
            if (res.success && res.ms === "catDeleted") {
                Swal.fire("Success", "Category Deleted", "success");
            }
            else {
                Swal.fire("Info", res.ms , "info");
            }

            GetAllCategoryForTable()
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }
    })
}

function GetCatById(cid) { 
    $.ajax({
        url: "/Products/getCatById",
        type: "get",
        data: { cid: cid },
        beforeSend: function () {
            Swal.fire({
                title: "Getting Data",
                text: "Getting Category , Please wait...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) { 
            if (res.success) { 
                $("#c_id").val(res.data[0]["c_id"]) 
                $("#c_name").val(res.data[0]["c_name"]) 
                $("#CatPrvImg").show()
                $("#CatPrvImg").prop("src", `/Uploads/Categories/${res.data[0]["c_img"]}`);
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        },
        complete: function () {
            Swal.close();
        }
    })
}

function addEditCategory() {
    var catName = $("#c_name").val() 

    if (!(catName)) {
        Swal.fire("Info", "Fill All Fields", "info");
        return
    }

    $("#c_name").val(function () {
        return $(this).val()?.trim();
    })

    var form = new FormData(document.getElementById("CategoryForm"));

    $.ajax({
        url: "/Products/AddEditCategory",
        type: "post",
        data: form,
        contentType: false,
        processData: false,
        beforeSend: function () {
            $("#btn_AddCat").prop("disabled", true)
            Swal.fire({
                title: "Saving",
                "text": "Adding your Category...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) {
            if (res.success) {
                if (res.ms === "catUpdated") {
                    Swal.fire("Success", "Category Updated", "success");
                }
                else {
                    Swal.fire("Success", "Category Added", "success");
                }
                document.getElementById("CategoryForm").reset();
                $("#CatPrvImg").prop("src", "#");
                $("#CatPrvImg").hide();
                GetAllCategoryForTable()

            }
            else {
                Swal.fire("Error", "Category Not Added", "error");
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        },
        complete: function () {
            $("#btn_AddCat").prop("disabled", false)
            $("#btn_AddCat").val("Save");
            $("#CategoryForm").find("h2").text("Add Category");
        }
    })
} 

function GetAllCategoryForTable() {
    $.ajax({
        url: "/Products/GetAllCategory",
        type: "get",
        success: function (res) {
             
            if ($.fn.DataTable.isDataTable('#CatTable')) {
                $('#CatTable').DataTable().destroy();
            }

            $("#CatTable tbody").empty();
             
            if (res.success && res.data && res.data.length > 0) {

                $.each(res.data, function (index, data) {

                    var img = null;
                    if (data.c_img != null) {
                        img = `<img src="/Uploads/Categories/${data.c_img}" height="50px" width="50px" style="object-fit:contain"/>`;
                    }
                    else {
                        img = `<img src="/userIcon/No_Image.jpg" height="50px" width="50px" style="object-fit:contain" />`;
                    }
                      

                    $("#CatTable tbody").append(`
                        <tr class="${data.c_status == false ? 'bg-secondary bg-opacity-50' : ''}">
                            <td> ${index + 1} </td>
                            <td> ${data.c_id ?? ""} </td>
                            <td> ${data.c_name ?? ""} </td>
                            <td> ${img ?? ""} </td>
                            <td>
                                <div class="form-check form-switch">
                                    <input class="form-check-input catStatusChange" type="checkbox" role="switch" data-id="${data.c_id}" ${(data.c_status) == true ? 'checked' : ''}>
                                </div>
                            </td>
                            <td> ${data.c_addDate.split("T")[0]??""} </td> 
                            <td> 
                                <button type="button" class="btn btn-success btn_editCat" data-id="${data.c_id}"><i class="fa-solid fa-wand-magic-sparkles"></i> </button>
                                <button type="button" class="btn btn-danger btn_deleteCat" data-id="${data.c_id}"><i class="fa-solid fa-trash-can"></i></button> 
                            </td>  
                        </tr>
                    `);
                });
            }
             
            $('#CatTable').DataTable();
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }
    })
}

function GetAllCategoryForDDL(CategoryDDLName) { 
    $.ajax({
        url: "/Products/GetAllCategory",
        type: "get",
        success: function (res) {
            $(`#${CategoryDDLName}`).empty().append('<option selected disabled>--Select Category--</option>')
            $.each(res.data, function (index, data) {

                $(`#${CategoryDDLName}`).append(`<option value="${data.c_id ?? ""}" >${data.c_name ?? ""}</option>`)
            })
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }
    })
}

function GetAllCategory() {
    $.ajax({
        url: "/Products/GetAllCategory",
        type: "get",
        success: function (res) {
            $("#AllCategory").empty().append(` 
                <button type="button" class="btn btn-outline-primary allCat" >All <i class="fa-solid fa-list"></i></button>
            `);
            $.each(res.data, function (index, data) {

                var img = "";
                if (data.c_img != null) {
                    img = `<img src="/Uploads/Categories/${data.c_img}" class="card-img-top" height="50px" style="object-fit:contain;" alt="...">`
                }
                else {
                    img = `<img src="/userIcon/No_Image.jpg" class="card-img-top" height="50px" style="object-fit:contain;" alt="...">`
                }

                $("#AllCategory").append(`
                    <div class="cat-item text-center" >
                        <div class="card catCard" data-id="${data.c_id}" style="cursor:pointer;">
                                ${img}
                            <div class="card-body p-2">
                                <h6 class="card-title mb-0 text-truncate">${data.c_name}</h6>
                            </div>
                        </div>
                    </div>
                `)
            })
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }
    })
}