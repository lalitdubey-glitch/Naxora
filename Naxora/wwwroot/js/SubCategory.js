 
$(document).ready(function () {

   

    $(document).on("click", ".btn_editSubCat", function () {
        var sid = $(this).data("id")
        getOneSubCatById(sid)
        $("#sid").val(sid); 
        $("#btn_AddSubCat").val("Edit")
        $("h2").text("Edit Details") 
    })

    $(document).on("click", ".btn_SubCatStatus", function () {
        var sid = $(this).data("id")
        changeSubCatStatus(sid)
    })


    $(document).on("click", ".btn_deleteSubCat", function () {
        var sid = $(this).data("id")
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to Delete this Sub Category!?",
            showCancelButton:true,
            showConfirmButton:true,

        }).then((res) => {
            if (res.isConfirmed) {
                deleteSubCategory(sid)
            }
        })
    })

})

function changeSubCatStatus(sid) { 
    $.ajax({
        url: "/Products/changeSubCatStatus",
        type: "post",
        data: { sid: sid },
        success: function (res) {
            if (res.success && res.ms === "statusChanged") {
                Swal.fire("Success", "Status Changed", "success");
            }
            else {
                Swal.fire("Error", "Status Not Changed : " + res.ms , "error");
            }
            GetAllSubCategoryForTable();
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}
function deleteSubCategory(sid) { 
    $.ajax({
        url: "/Products/deleteSubCategory",
        type: "post",
        data: { sid: sid },
        success: function (res) {
            if (res.success && res.ms === "subCatDeleted") {
                Swal.fire("Success", "Sub Cat Deleted", "success");
            }
            else {
                Swal.fire("Error", "Sub Cat Not Deleted : " + res.ms , "error");
            }
            GetAllSubCategoryForTable();
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}

function getOneSubCatById(sid) { 
    $.ajax({
        url: "/Products/getOneSubCatById",
        type: "get",
        data: { sid: sid },
        success: function (res) { 
            $("#CatDDL1").val(res.data[0]["c_id"]);
            $("#SubCatName").val(res.data[0]["subCat_name"]);
            $("#SubCatPrvImg").show();
            $("#SubCatPrvImg").prop("src", `/Uploads/SubCategory/${res.data[0]["subCat_img"]}`);
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}

function addEditSubCategory() {

    var CatDDL1 = $("#CatDDL1").val();
    var SubCatName = $("#SubCatName").val(); 

    if ((!(CatDDL1) || !(SubCatName))) {
        Swal.fire("Info", "Fill All Fields", "info");
        return
    }

    $("#SubCatName").val(function () {
        return $(this).val()?.trim();
    })

    var form = new FormData(document.getElementById("SubCategoryForm"));

    $.ajax({
        url: "/Products/AddEditSubCategory",
        type: "post",
        data: form,
        contentType: false,
        processData: false,
        beforeSend: function () {
            $("#btn_AddSubCat").prop("disabled", true)
            Swal.fire({
                title: "Saving",
                "text": "Adding your Sub Category...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) {
            if (!res.success && res.ms == "fillAllFields") {
                Swal.fire("Info", "Please Fill All Required <span class='text-danger'>*</span> Fields", "info");
                return
            }
            else if (res.ms === "alreadyExists") {
                Swal.fire("Info", "Sub Category Already Exists!", "info");
                return
            }
            else if (res.success && res.ms ==="subCatAdded") {
                Swal.fire("Success", "Sub Category Added", "success");
            
            }
            else if (res.success && res.ms === "subCatUpdated") {
                Swal.fire("Success", "Sub Category Updated", "success");
            }
            else {
                Swal.fire("Error", "Sub Category Not Added " + res.ms, "error");
            }

            GetAllSubCategoryForTable();
            document.getElementById("SubCategoryForm").reset();
            $("#SubCatPrvImg").prop("src", "#");
            $("#SubCatPrvImg").hide();
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        },
        complete: function () {
            $("#btn_AddSubCat").prop("disabled", false)
            $("#btn_AddSubCat").val("Add Sub Category")
            $("#SubCategoryForm").find("h2").text("Add Sub Category")
        }
    })
}

function GetAllSubCategoryByCatId(c_id) {
    $.ajax({
        url: "/Products/GetAllSubCatByCategoryId",
        type: "get",
        data: {c_id : c_id},
        success: function (res) { 
            if (res.success && res.data.length>0) {
                $("#AllSubCategory").empty();
                $.each(res.data, function (index, data) {
                    var img = "";
                    if (data.subCat_img != null) {
                        img = `<img src="/Uploads/SubCategory/${data.subCat_img}" class="card-img-top" height="50px" style="object-fit:contain;" alt="...">`
                    }
                    else {
                        img = `<img src="/userIcon/No_Image.jpg" class="card-img-top" height="50px" style="object-fit:contain;" alt="...">`
                    }

                    $("#AllSubCategory").append(`
                    <div class="subcat-item text-center">
                        <div class="card subCatCard" data-id="${data.subCat_id}" style="cursor:pointer;">
                            ${img}
                            <div class="card-body p-2">
                                <h6 class="card-title mb-0 text-truncate">${data.subCat_name}</h6>
                            </div>
                        </div>
                    </div>
                `)
                })
            }
            else {
                $("#AllSubCategory").empty().append("<h2 class='text-center m-4'>No Sub Category Available for this Category!</h2>");
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }
    })
}

function GetAllSubCategoryForTable() {
    $.ajax({
        url: "/Products/GetAllSubCategory",
        type: "get",
        success: function (res) {
                if ($.fn.DataTable.isDataTable('#SubCatTable')) {
                    $('#SubCatTable').DataTable().destroy();
                }
                $("#SubCatTable tbody").empty();
            if (res.success && res.data.length > 0) {

                $.each(res.data, function (index, data) {

                    var img = null;
                    if (data.subCat_img != null) {
                        img = `<img src="/Uploads/SubCategory/${data.subCat_img}" height="50px" width="50px" style="object-fit:contain"/>`
                    }
                    else {
                        img = ` <img src="/userIcon/No_Image.jpg" height="50px" width="50px" style="object-fit:contain" />`
                    }

                    $("#SubCatTable tbody").append(`
                    <tr ${data.subCat_status == false ? "class='bg-secondary'" : ''}>
                        <td>${index + 1}</td>
                        <td>${data.subCat_id}</td>
                        <td>${data.subCat_name ?? ""}</td>
                        <td>
                            ${img}
                        </td>
                        <td>${data.c_id ?? ""}</td>
                        <td>
                             <div class="form-check form-switch">
                                 <input class="form-check-input btn_SubCatStatus" type="checkbox" role="switch" data-id="${data.subCat_id}" ${(data.subCat_status) == true ? 'checked' : ''}>
                             </div>
                        </td>
                        <td>${data.subCat_Adddate.split("T")[0] ?? ""}</td>
                        <td>
                            <button type="button" class="btn btn-success btn_editSubCat" data-id="${data.subCat_id}"><i class="fa-solid fa-wand-magic-sparkles"></i> </button>
                            <button type="button" value="Delete" class="btn btn-danger btn_deleteSubCat" data-id="${data.subCat_id}"><i class="fa-solid fa-trash-can"></i></button>
                           
                        </td>
                    </tr>
                `)
                })
            }
            $('#SubCatTable').DataTable(); 
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
            
        }

    })
}

function GetAllSubCategoryForDDL(c_id , callback) {
    $.ajax({
        url: "/Products/GetAllSubCatByCategoryId",
        type: "get",
        data: {c_id : c_id},
        success: function (res) { 
            $("#SubCatDDL").empty().append('<option selected disabled>--Select Sub Category--</option>')

            $.each(res.data, function (index, data) {
                $("#SubCatDDL").append(`<option value="${data.subCat_id ?? ""}">${data.subCat_name ?? ""}</option>`)
            })

            if (typeof callback === "function") {
                callback();
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}

