$(document).ready(function () {

    GetAllProductsForTable();
    GetAllCategoryForTable();
    GetAllSubCategoryForTable();


    GetAllCategoryForDDL("CatDDL1");
    GetAllCategoryForDDL("CatDDL2") 


    ImagePreview("CatImg", "CatPrvImg");
    ImagePreview("SubCatImg", "SubCatPrvImg");
    ImagePreview("ProductImg", "ProductPrvImg");

    getAllUsers()

    $(document).on("change", ".btn_UserStatus", function () {
        var uid = $(this).data("id"); 
        ChangeUserStatus(uid)
    })

    $(document).on("click", ".btn_UserEdit", function () {
        var uid = $(this).data("id");
        $("#EditUserForCrudForm").show();
        getOneUsersById(uid)
    }) 

    $(document).on("click", ".btn_UserDelete", function () {
        var uid = $(this).data("id");
        Swal.fire({
            title: "Are You Sure?",
            text: "You Want to delete this user?",
            icon:"info",
            allowOutsideClick: false,
            showCancelButton: true,
            showConfirmButton: true
        }).then((res) => {
            if (res.isConfirmed) {
                DeleteUser(uid)
            }
        })
        
    }) 

    
})

function ChangeUserStatus(uid) {
    $.ajax({
        url: "/admin/ChangeUserStatus",
        type: "post",
        data: { uid: uid },
        success: function (res) {
            if (res.success && res.ms ==="StatusChanged") {
                Swal.fire("Success", "Status Changed", "success");
            }
            else {
                Swal.fire("Info", "Status Not Changed! " + res.ms, "info");
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }

    })
}

function DeleteUser(uid) {
    $.ajax({
        url: "/admin/DeleteUser",
        type: "post",
        data: { uid: uid },
        success: function (res) {
            if (res.success && res.ms ==="userDeleted") {
                Swal.fire("Success", "User Deleted", "success");
            }
            else {
                Swal.fire("Info", "User Not Deleted! " + res.ms, "info");
            }
            getAllUsers()
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }

    })
}

function getAllUsers() {
    $.ajax({
        url: "/admin/GetAllUsers",
        type: "get", 
        success: function (res) {
            if (res.success && res.data.length > 0) {
                var tableBody = $("#userTable tbody");
                tableBody.empty();

                $.each(res.data, function (index, data) { 
                    tableBody.append(
                        `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${data.u_id}</td>
                        <td>${data.u_name}</td> 
                        <td>${data.email}</td> 
                        <td>${data.pincode}</td> 
                        <td>${data.state}</td> 
                        <td>${data.dist}</td> 
                        <td>${data.vill}</td> 
                        <td>${data.regDate.split("T")[0]}</td> 
                        <td>${data.role}</td> 
                        <td>
                            <div class="form-check form-switch">   
                                  <input type="checkbox" role="switch" class="form-check-input btn_UserStatus" data-id="${data.u_id}" ${data.status === true ? 'checked' : ''}/>
                            </div>
                        </td> 
                        <td class="text-nowrap">
                            <button type="button" class="btn btn-outline-success btn_UserEdit" data-id="${data.u_id}"> <i class="fa-solid fa-wand-magic-sparkles"></i>  </button>

                            <button type="button" class="btn btn-outline-danger btn_UserDelete" data-id="${data.u_id}"><i class="fa-solid fa-trash-can"></i></button>
                        </td> 
                    </tr>
                    `
                    )
                    
                }) 
                $('#userTable').DataTable({ destroy: true });
            }
            else {
                Swal.fire("Info" , "Data Not Found" , "info")
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
       

    })
}

function getOneUsersById(uid) {
    $.ajax({
        url: "/admin/getOneUsersById",
        type: "get",
        data: {uid : uid},
        beforeSend: function () {
            Swal.fire({
                title: "Getting User Details",
                text: "Please wait while fething the details...",
                allowOutsideClick: false,
                showCancelButton: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) {
            if (res.success && res.data.length > 0) {
                Swal.fire("Info", "User Found", "success") 
                $.each(res.data, function (index, data) {

                    $("#uid").val(data.u_id ?? "") 
                    $("#U_name").val(data.u_name ?? "") 
                    $("#role").val(data.role ?? "") 

                    setTimeout(function () {
                        Pincode(data.pincode ?? "", data.vill ?? "")
                    }, 1500)

                    $("#pincode").val(data.pincode ?? "")
                    $("#state").val(data.state ?? "")
                    $("#dist").val(data.dist ?? "")
                })
            }
            else {
                Swal.fire("Info", "User Not Found", "info")
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error" ,  "Something went wrong, Please check your internet connection or Try Again Leter...!" , "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        },
        complete: function () {
            //Swal.close();
        }
    })
}

function EditUserDetailsForAdminCrud() {
    var form = new FormData(document.getElementById("EditUserForCrudForm"));

    $.ajax({
        url: "/admin/EditUserDetailsForAdminCrud",
        type: "post",
        data: form,
        processData: false,
        contentType:false,
        beforeSend: function () {
            Swal.fire({
                title: "Saving Details",
                text: "Please wait while saving the details...",
                allowOutsideClick: false,
                showCancelButton: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) {
            getAllUsers();

            if (res.ms === "invalidData") {
                Swal.fire("Info", "Please fill all the Required <span class='text-danger'>*</span> fields", "info")
            }
            else if (res.success && res.ms ==="userUpdated") {
                Swal.fire("Success", "User Details Save", "success") 
                document.getElementById("EditUserForCrudForm").reset();
                $("#vill").empty();
                $("#EditUserForCrudForm").hide();
            }
            else {
                Swal.fire("Info", "Details Not Saved", "info")
            }

            
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error" ,  "Something went wrong, Please check your internet connection or Try Again Leter...!" , "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        },
        complete: function () {
            //Swal.close();
        }
    })
}