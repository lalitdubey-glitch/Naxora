$(document).ready(function () {  

    GetLoggedInUser(); 
    GetAllCategory(); 
    ShowCartItems();

    $(document).on("click",".catCard", function () {
        var cid = $(this).data("id");
        GetAllSubCategoryByCatId(cid);
        selectAllProductdByCatId(cid)
    })

    $(document).on("click",".subCatCard", function () {
        var sid = $(this).data("id"); 
        selectAllProductdBySubCatId(sid)
    })

    $(document).on("click", ".allCat", function () {
        $("#AllSubCategory").empty();
        selectAllPrdForLoggedInUser();
    }) 
    

    //Plus Button (+) 
    $(document).on("click", ".btn_right", function () { 
        var btnCenter = $(this).siblings(".btn_center"); 
        var p_id = $(this).data("id");
        var count = parseInt(btnCenter.text().trim(), 10) || 0;
        count++;   
        btnCenter.text(count);

        AddItemToCarts(p_id);
        
    });

    //Minus Button (-) 
    $(document).on("click", ".btn_left", function () { 
        var btnCenter = $(this).siblings(".btn_center");
        var count = parseInt(btnCenter.text().trim(), 10) || 0;
        var p_id = $(this).data("id");
        if (count > 1) {
            count--;  
            btnCenter.text(count);
        }
        else { 
            var btnGroup = $(this).closest(".btn_addItems"); 
            btnGroup.addClass("d-none");
            btnGroup.siblings(".btn_cart").removeClass("d-none");
            btnCenter.text(1);
        }
        
            BtnMinus(p_id) 

    });

    $(document).on("click", ".btn_cart", function () { 
        var p_id = $(this).data("id");
        var clickedBtn = $(this);
        var userId = $("#hdnUserId").val(); 
        if (!userId) {
            Swal.fire({
                title: "Login Required",
                text: "Please log in first to add items to your cart.",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Login",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/home/Login/';
                }
            });
            return

        }

        $(this).addClass('d-none')
        $(this).parent().find(".btn_addItems").removeClass('d-none');
        AddItemToCarts(p_id);  
    })

    


    $("#pincode").on("keyup", function () { 
        var pincode = $(this).val().trim();
        if ($(this).val().length == 6) {
            Pincode(pincode)
        }
    }) 

  //------Sign Up

    $("#btn_SignUp").on("click", function () {
        var email = $("#email").val();
        var name = $("#name").val();
        var pass = $("#pass").val();
        var pincode = $("#pincode").val();

        if (!(email) || !(name) || !(pass) || !(pincode)) { 
            Swal.fire("Info", "Please Fill All Required <span class='text-danger'>*</span> Fields", "info");
            return;
        } 

        $("#name, #email, #pass , #pincode").val(function () {
            return $(this).val()?.trim() ?? ""; 
        })

        var form = new FormData(document.getElementById("SignUpForm"));
        $.ajax({
            url: "/home/SignUp",
            type: "post",
            data: form,
            processData: false,
            contentType: false,
            beforeSend: function () {
                $("#btn_SignUp").prop("disabled" , true)
                Swal.fire({
                    title: "Saving...",
                    text: "Saving your data..",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                })
            },
            success: function (res) { 
                if (res.ms == "EmailAlreadyExists") {
                    Swal.fire("Error", "Email Already Exists!", "error");
                } 
                else if (res.success) {
                    Swal.fire("Success", "Your data Saved!", "success");
                    document.getElementById("SignUpForm").reset();
                    $("#btn_SignUp").prop("disabled", false)
                    setTimeout(function () {
                        window.location.href = "/home/Login";
                    }, 2000);
                } 
                else {
                    Swal.fire("Error", "Data Not Saved!", "error");
                    
                }
            }, 
            error: function (xhr, status, error) {
                Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
                var err = JSON.parse(xhr.responseText)
                console.log("Error : " + err)
            },
            complete: function () {
                $("#btn_SignUp").prop("disabled", false);
            }

        })
    })

    // ---Login

    $("#btn_Login").on("click", function () {
      
        var email = $("#email").val().trim();
        var pass = $("#pass").val().trim();

        if (!(email) || !(pass)) { 
            Swal.fire("Info", "Please provide your credentials <span class='text-danger'>*</span> to login..! ", "info");
            return;
        }

        $.ajax({
            url: "/home/login",
            type: "post",
            data: { email: email, pass, pass },
            beforeSend: function () {
                $("#btn_Login").prop("disabled", true);
                Swal.fire({
                    title: "Loggin in...",
                    text: "Redirecting to Home page , Please wait...",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                })
            },
            success: function (res) { 
                if (res.success) {
                    Swal.fire("Success", "Logged in", "success"); 
                    document.getElementById("LoginForm").reset();
                    window.location.href = "/home/index"
                } 
                else {
                    Swal.fire("Error", "Invalid Credentials!", "error"); 
                }

                
            },
            error: function (xhr, status, error) {
                Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
                var err = JSON.parse(xhr.responseText)
                console.log("Error : " + err)
            },
            complete: function () {
                $("#btn_Login").prop("disabled", false);
            }
        })
        

    })

    //------Send OTP

    $("#btn_sendOTP").on("click", function () {
        var email = $("#email").val().trim();
        if (!email) { return;  }

        $.ajax({
            url: "/home/SendOTP",
            type: "post",
            data: { email: email },
            beforeSend: function () {
                $("#btn_sendOTP").prop("disabled", true);
                Swal.fire({
                    title: "Sending OTP",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                })
            },
            success: function (res) {
                if (res.success) {
                    Swal.fire("Success", "OTP Sent", "success");
                    $("#SendOTPModal").modal('hide');
                    $("#VerifyOTPModal").modal('show');
                }
                else {
                    Swal.fire("Error", "OTP Not Sent", "error");
                }
            },
            error: function (xhr, status, error) {
                Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
                var err = JSON.parse(xhr.responseText)
                console.log("Error : " + err)
            },
            complete: function () {
                $("#btn_sendOTP").prop("disabled", false);
            }
        })
    })

    $("#btn_VerifyOTP").on("click", function () {
        var otp = $("#otp").val().trim();
        if (!otp) {
            Swal.fire("Info", "Please Enter OTP", "info");
            return;
        }

        $.ajax({
            url: "/home/VerifyOTP",
            type: "post",
            data: { otp: otp },
            beforeSend: function () {
                $("#btn_VerifyOTP").prop("disabled", true);
                Swal.fire({
                    title: "Verifying OTP",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                })
            },
            success: function (res) {
                if (res.success) {
                    Swal.fire("Success", "OTP Verified!", "success"); 
                    $("#VerifyOTPModal").modal('hide');
                    $("#ChangePassModal").modal('show');
                }
                else {
                    Swal.fire("Error", "OTP Not Matched!", "error");
                }
            },
            error: function (xhr, status, error) {
                Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
                var err = JSON.parse(xhr.responseText)
                console.log("Error : " + err)
            },
            complete: function () {
                $("#btn_VerifyOTP").prop("disabled", false);
            }
        })
    })

    //-------Change Password

    $("#btn_ChangePass").on("click", function () {
        var pass = $("#pass").val().trim();
        if (!pass) {
            Swal.fire("Info", "Please Enter your new Password", "info");
            return;
        }

        $.ajax({
            url: "/home/ChangePass",
            type: "post",
            data: { pass: pass },
            beforeSend: function () {
                Swal.fire({
                    title: "Chnaging your Password",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                })
            },
            success: function (res) {
                if (res.success) {
                    Swal.fire("Success", "Password Changed!", "success");  
                    $("#ChangePassModal").modal('hide');

                }
                else {
                    Swal.fire("Error", "Password not Changed!", "error");
                }
            },
            error: function (xhr, status, error) {
                Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
                var err = JSON.parse(xhr.responseText)
                console.log("Error : " + err)
            }
        })
    })


    //------Edit User

    $("#btn_editUserModal").on("click", function () {
        GetDetailsForEdit();
    })

    // This is for logged in user, NOT FOR ADMIN CRUD
    $("#btn_EditUser").on("click", function () { 
        var name = $("#name").val(); 
        var pincode = $("#pincode").val();

        if (!(name) || !(pincode)) {
            Swal.fire("Info", "Please fill all mandatory fields!", "info");
            return;
        }

        $("#name,#pincode").val(function () {
            return $(this).val()?.trim() ?? "";
        })

        var form = new FormData(document.getElementById("EditUserForm"));
         
        $.ajax({
            url: "/home/EditUser",
            type: "post",
            data: form,
            processData: false,
            contentType: false,
            beforeSend: function () {
                $("#btn_editUser").prop("disabled", true)
                Swal.fire({
                    title: "Saving...",
                    text: "Saving your data..",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                })
            },
            success: function (res) {
                if (res.ms ==="userNotLoggedIn") {
                    location.href="/home/Login"
                }
                else if (res.ms === "invalidData") {
                    Swal.fire("Info", "Please fill all Required <span class='text-danger'>*</span> Fields!", "info");
                }
                else if (res.success && res.ms ==="userUpdated") {
                    Swal.fire("Success", "Your data Edited Successfully!", "success");
                    document.getElementById("EditUserForm").reset(); 
                    $("#EditUserDetailstModal").modal("hide");
                    GetLoggedInUser();
                }
                else {
                    Swal.fire("Error", "Data Not Edited!", "error"); 
                }
            },
            error: function (xhr, status, error) {
                Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
                var err = JSON.parse(xhr.responseText)
                console.log("Error : " + err)
            },
            complete: function () {
                $("#btn_EditUser").prop("disabled", false);
            }
        })
    })



})

function GetDetailsForEdit() {
    $.ajax({
        url: "/home/GetLoggedInUser",
        type: "get",
        beforeSend: function () {
            Swal.fire({
                title: "Gettting User Details",
                text: "Please wait while fetching the data...",
                allowOutsideClick: false,
                showCancelButton: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) {
            if (res.data) {
                $.each(res.data, function (index, data) {

                    $("#name").val(data.u_name ?? "")
                    $("#email").val(data.email ?? "")

                    setTimeout(function () {
                        Pincode(data.pincode ?? "", data.vill ?? "")
                    }, 1500)

                    $("#pincode").val(data.pincode ?? "")
                    $("#state").val(data.state ?? "")
                    $("#dist").val(data.dist ?? "")
                })
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}

function GetLoggedInUser() {
     
    $.ajax({
        url: "/home/GetLoggedInUser",
        type: "get", 
        success: function (res) {
             
            $.each(res.data, function (index, data) {
                 
                $("#UserDetails").empty().append(` 
                                 <p><strong>Email : </strong> ${data.email??""} </p>
                                 <p><strong>Pincode : </strong> ${data.pincode??""} </p>
                                 <p><strong>State : </strong> ${data.state??""} </p>
                                 <p><strong>District : </strong> ${data.dist??""} </p>
                                 <p><strong>Village : </strong> ${data.vill??""} </p>
                                 <p><strong>Status : </strong> <span class="${data.status == true ? 'text-success' : 'text-danger'}"> ${data.status == true ? "Online" : "Offline"} </span> </p>
                                 <p><strong>Registered On : </strong> ${data.regDate.split('T')[0]??""} </p>
                            `)

                $("#userInfoOffcanvasTitle span").text(`Hi ${data.u_name??"Guest"}`)
             
            }) 
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}

function Pincode(pincode, seletedVill=null) {
    $.ajax({
        url: "/home/Pincode",
        type: "get",
        data: { pincode, pincode },
        beforeSend: function () {
            Swal.fire({
                title: "Loading...",
                text: "Please wait while Loading the data...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) {
            if (res.data != null) { 
                $("#state").val(res.data[0]["state"])
                $("#dist").val(res.data[0]["dist"])
                $("#vill").empty().append(`<option disabled selected>--Select Village--</option>`)
                $.each(res.data, function (index, data) {
                    $("#vill").append(` 
                            <option value="${data.vill}">${data.vill}</option>
                        `)
                })

                if (seletedVill) {
                    $("#vill").val(seletedVill)
                }
                Swal.close();
            }
            else {
                Swal.fire("Error", "Pincode not found, Try Again!", "error");
            }

        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        },
        complete: function () {
            //Swal.close();
        }
    })
}

function ImagePreview(img_Id, prvImg_Id) {
    $(`#${img_Id}`).on("change", function () {
        $(`#${prvImg_Id}`).show();
        var file = this.files[0];
        if (file) {
            $(`#${prvImg_Id}`).prop("src", URL.createObjectURL(file))
        }
    })
} 

function AddItemToCarts(productId, e) {
    //e.preventDefault();
    $.ajax({
        url: "/Products/AddCart",
        type: "post",
        data: { p_id: productId },
        success: function (res) {
            if (res.success) {
                ShowCartItems();
            }
            else {
                Swal.fire("Info" , "Product Not Added" , "info")
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}

function BtnMinus(productId,e) {
   //e.preventDefault();

    $.ajax({
        url: "/Products/BtnMinus",
        type: "post",
        data: { p_id: productId },
        success: function (res) { 
            if (res.success) {
                ShowCartItems();
            } 
            else {
                Swal.fire("Info", "Product Not Found", "info")
            }
           
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log("Error : " + err)
        }

    })
}
 