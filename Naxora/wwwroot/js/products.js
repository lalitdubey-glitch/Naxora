$(document).ready(function () {

    $(document).on("click", ".btn_ProductStatus", function () {
        var pid = $(this).data("id"); 
        ChangeProductStatus(pid)
    })

    $(document).on("click", ".btn_EditProduct", function () {
        var pid = $(this).data("id"); 
        $("#pid").val(pid);
        $("h2").text("Edit Product Details")
        $("#btn_AddProduct").val("Edit")

        GetOneProductById(pid)
    })


    $(document).on("click", ".btn_DeleteProduct", function () {
        var pid = $(this).data("id");
        Swal.fire({
            title: "Are You Sure?",
            text: "This action will also remove product from Users Cart",
            showCancelButton:true,
            showConfirmButton:true,

        }).then((res)=>{
            if (res.isConfirmed) {
                DeleteProduct(pid)
            }
        })
    })

    //cart ke ander ka delete button
    $(document).on("click", ".btn_deleteCartItems", function () {
        var pid = $(this).data("id"); 
        var btn_PlusMinus = $(this).closest(".card").find(".btn_PlusMinus");

        Swal.fire({
            title: "Are You Sure?",
            text: "This action will remove product from Cart",
            showCancelButton:true,
            showConfirmButton:true,

        }).then((res)=>{
            if (res.isConfirmed) {
                DeleteProductFromCart(pid, btn_PlusMinus)
            }
        })
    })

    $(document).on("change", "#CatDDL2", function () {
        var cid = $(this).val();
        GetAllSubCategoryForDDL(cid) 
    })
   
})

function ChangeProductStatus(pid) {
    $.ajax({
        url: "/products/ChangeProductStatus",
        type: "post",
        data: { pid: pid },
        success: function (res) {
            if (res.success) {
                Swal.fire("Success", "Satatus Changed", "success");  
            }
            else {
                Swal.fire("Error", "Product Not Found " + res.ms, "error");
            }
            GetAllProductsForTable()
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}
 
function DeleteProduct(pid) { 
    $.ajax({
        url: "/products/DeleteProduct",
        type: "post",
        data: { pid: pid },
        success: function (res) {
            if (res.success && res.ms ==="deletedPrd") { 
                Swal.fire("Success", "Product Deleted", "success");
            }
            else {
                Swal.fire("Error", "Product Not Deleted " + res.ms, "error");
            }

            GetAllProductsForTable();
           
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}

function DeleteProductFromCart(pid, btnPlusMinusId) {
    $.ajax({
        url: "/products/DeleteProductFromCart",
        type: "post",
        data: { pid: pid },
        success: function (res) { 
            if (res.success) { 
                Swal.fire("Success", "Product Deleted", "success");
                ShowHideCardPlusMinusButtons(pid, res.productQuantity, btnPlusMinusId)
            }
            else {
                Swal.fire("Error", "Product Not Deleted " + res.ms, "error");
            }
            ShowCartItems();
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}

function OrderAll() { 
    $.ajax({
        url: "/products/OrderAll",
        type: "post", 
        success: function (res) { 
            if (res.success) { 
                Swal.fire("Success", "All Product Ordered Successfully!", "success");
            }
            else {
                Swal.fire("Info", "Order Not Complete" + res.ms, "info");
            }
            ShowCartItems()
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}


//index page, Sub Categories based products
function selectAllProductdBySubCatId(sid) { 
    $.ajax({
        url: "/products/getAllProductdBySubCatId",
        type: "get",
        data: { sid: sid },
        success: function (res) {
            if (res.data && res.data.length > 0) { 
                var divId = $("#AllProducts");
                showAllProducts(res.data, divId)
                 
            }
            else {
                $("#AllProducts").empty().append("<h2 class='text-center m-4'>No Product</h2>");
                Swal.fire("Info", "No Product Available", "info");
            }
            
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}

//index page, Categories based products
function selectAllProductdByCatId(cid) {  
    $.ajax({
        url: "/products/getAllProductdByCatId",
        type: "get",
        data: { cid: cid },
        success: function (res) {
            if (res.data && res.data.length > 0) { 
                var divId =  $("#AllProducts");
                showAllProducts(res.data, divId)
            }
            else {
                $("#AllProducts").empty().append("<h2 class='text-center m-4'>No Product</h2>");
                Swal.fire("Info", "No Product Available", "info");
            }
            
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}

//For Edit
function GetOneProductById(pid) { 
    $.ajax({
        url: "/products/GetOneProductById",
        type: "get",
        data: { pid: pid },
        success: function (res) {
            if (res.success) { 
                $("#p_name").val(res.data[0]["p_name"])
                $("#p_price").val(res.data[0]["p_price"])
                $("#p_discountPrice").val(res.data[0]["p_discountPrice"]) 
                $("#Show_p_discountPricePrv").val(res.data[0]["p_TotalDiscountInPercentage"])
                $("#Show_p_discountPrice").val(res.data[0]["p_TotalDiscountInPercentage"])
                $("#p_discription").val(res.data[0]["p_discription"])
                $("#ProductPrvImg").show();
                $("#ProductPrvImg").prop("src", `/Uploads/Products/${res.data[0]["p_img"]}`)

                $("#CatDDL2").val(res.data[0]["c_id"])

                GetAllSubCategoryForDDL(res.data[0]["c_id"], function () {
                    $("#SubCatDDL").val(res.data[0]["subCat_id"])
                }) 

               
            }
            else {
                Swal.fire("Error", "Product Not Found", "error");
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}

function btn_buy(pid) {
   
    $.ajax({
        url: "/products/DeleteProductFromCart",
        type: "post",
        data: { pid: pid },
        success: function (res) { 
            if (res.success) { 
                Swal.fire("Success", "Order Placed!", "success");
            }
            else {
                Swal.fire("Error", "Something Wrong", "error");
            }
            ShowCartItems();
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}

// Buy item one by one

$(document).on("click", ".btn_buy", function () {
     
    var Userid = $("#hdnUserId").val().trim();
    if (!(Userid)) {
        Swal.fire({
            title: "Login",
            "text": "Please Login first to Send any order..!",
            icon: "info",
            showCancelButton : true,
            confirmButtonText:"Login",
        }).then((result) => {
            if (result.isConfirmed) {
                return window.location.href = "/home/Login";
            }
        })

        return
    }
     
    //clear the badge number
    var pid = $(this).data("id") 
    var pQty = $(this).data("qty");
      
     
    if (pid && (pQty>0)) {
        btn_buy(pid)
    }

    $(`#AllProducts, #CartItems`).find(`[data-id="${pid}"]`).closest('.btn_PlusMinus').html(`
            <button type="button" class="btn-sm btn-outline-dark form-control btn_cart" data-id="${pid}">
                <i class="fa-solid fa-cart-shopping"></i>
            </button>`);
             

    Swal.fire("Success", "Order Placed!", "success");
    const phoneNumber = "919455648626";
    const name = $(this).data("name") || "N/A";
    const price = parseFloat($(this).data("price")) || 0;
    const qty = parseInt($(this).closest(".card-body").find(".btn_center").text().trim()) || 1;
    const total = price * qty;

    // Website ka base domain + image path 
    const imgName = $(this).closest(".card").find("img").attr("src");
    const fullImageUrl = new URL(imgName, window.location.origin).href;

    const message = `*Hello, I want to order this item!* \n\n` +
        `*Product Image:* ${fullImageUrl}\n\n` +
        `*Product Name:* ${name}\n` +
        `*Quantity:* ${qty}\n` +
        `*Price:* ₹${price}\n` +
        `*Total Price:* ₹${total}\n\n` +
        `Please confirm availability.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
   
});
 
//Buy all Items from cart at once

$(document).on("click", "#btn_buy_all", function () {

    var Userid = $("#hdnUserId").val().trim();
    if (!(Userid)) {
        Swal.fire({
            title: "Login",
            "text": "Please Login first to Send any order..!",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Login",
        }).then((result) => {
            if (result.isConfirmed) {
                return window.location.href = "/home/Login";
            }
        })

        return
    }

    //clear the badge number
    OrderAll();


    const phoneNumber = "919455648626";
    let itemsText = "";
    let grandTotal = 0;

    // Har product card par loop
    $("#CartItems .card").each(function (index) {
        var pid = $(this).find("[data-id]").data("id");
        var btnPlusMinusId = $(this).find(".btn_PlusMinus");

        const title = $(this).find(".card-title").text().trim();
        const qty = parseInt($(this).find(".btn_center").text().trim()) || 1;

        // Discounted price extract karna
        const priceText = $(this).find(".text-success").text().replace(/[^0-9.]/g, "");
        const price = parseFloat(priceText) || 0;
        const total = price * qty;
        grandTotal += total;

        itemsText += `${index + 1}. *${title}*\n  *Price:* ${price}  \n  *Qty:* ${qty}  | *Total:* ₹${total}\n`;
        ShowHideCardPlusMinusButtons(pid, pqty='0', btnPlusMinusId) 

    });

    if (grandTotal === 0) {
        alert("Cart is empty!");
        return;
    }

    const message = `*New Cart Order*\n\n` +
        `*Order Details:*\n${itemsText}\n` +
        `*Grand Total:* ₹${grandTotal}\n\n` +
        `Please confirm my order.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
});


$("#p_price, #p_discountPrice").on("input change", function () {
    ShowDiscount();
});

function ShowDiscount() {
    var priceStr = $("#p_price").val().trim();
    var discStr = $("#p_discountPrice").val().trim();
     
    if (!priceStr || !discStr) {
        $("#Show_p_discountPrice").val('');
        $("#Show_p_discountPricePrv").val('');
        return;
    }

    var price = parseFloat(priceStr);
    var discPrice = parseFloat(discStr);
     
    if (price < 0 || discPrice < 0) {
        Swal.fire("Warning", "Price or Discount can not be negative!", "warning");

        // Jo field negative hui hai use khali kar do
        if (price < 0) $("#p_price").val('');
        if (discPrice < 0) $("#p_discountPrice").val('');

        $("#Show_p_discountPrice").val('');
        $("#Show_p_discountPricePrv").val('');
        return;
    }
     
    if (price === 0) {
        $("#Show_p_discountPrice").val('');
        $("#Show_p_discountPricePrv").val('');
        return;
    }
     
    if (discPrice > price) {
        Swal.fire("Info", "Discount Price must be less than Original Price", "info");
        $("#p_discountPrice").val('');
        $("#Show_p_discountPrice").val('');
        $("#Show_p_discountPricePrv").val('');
        return;
    }
     
    var disc = ((price - discPrice) / price) * 100;
    $("#Show_p_discountPrice").val(disc.toFixed(2));
    $("#Show_p_discountPricePrv").val(disc.toFixed(2) + " %OFF");
}

function AddEditProduct() {  

    var emptyField = $("#p_name, #p_price, #p_discountPrice, #Show_p_discountPrice").filter(function () {
        return $(this).val().trim() === "";
    }).first();

    if (emptyField.length) {
        var placeholder = emptyField.attr("placeholder") || "Some Important fields";
        Swal.fire("Warning", `Please fill "${placeholder}" !`, "warning").then(() => {
            emptyField.focus();
        });
        return;
    }

    $("#p_name, #p_price , #p_discountPrice, #p_discription").val(function () {
        return $(this).val()?.trim();
    })
 

    var form = new FormData(document.getElementById("ProductForm")); 

    $.ajax({
        url: "/Products/AddEditProduct",
        type: "post",
        data: form,
        contentType: false,
        processData: false,
        beforeSend: function () {
            $("#btn_AddProduct").prop("disabled", true)
            Swal.fire({
                title: "Saving",
                "text": "Adding your Product, Please wait...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            })
        },
        success: function (res) {
            if (!res.success || res.ms == "FillAllFields") {
                Swal.fire("Info", "Please Fill All Required <span class='text-danger'>*</span> Fields", "info");
            }
            else if (res.success && res.ms ==="prdAdded") {
                Swal.fire("Success", "Product Added", "success");
            }
            else if (res.success && res.ms === "editedPrd") {
                Swal.fire("Success", "Product Updated", "success");
            }
            else {
                Swal.fire("Error", "Product Not Added", "error");
            }
            document.getElementById("ProductForm").reset();
            $("#ProductPrvImg").prop("src", "#");
            $("#ProductPrvImg").hide();
            GetAllProductsForTable()
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        },
        complete: function () {
            $("#btn_AddProduct").prop("disabled", false)
            $("#ProductForm").find("h2").text("Add Product")
            $("#btn_AddProduct").val("Add Product");
            $("#SubCatDDL").empty();
        }
    })
}

function GetAllProductsForTable() {
    $.ajax({
        url: "/Products/GetAllProductForCrud",
        type: "get", 
        success: function (res) {
            if ($.fn.DataTable.isDataTable('#ProductTable')) {
                $('#ProductTable').DataTable().destroy();
            }

            var table = $("#ProductTable tbody");
            table.empty();
            if (res.success && res.data.length>0) { 
                $.each(res.data, function (index, data) {
                    var img = null;
                    if (data.p_img != null) {
                        img = `<img src="/Uploads/Products/${data.p_img}" height="50px" width="50px" style="object-fit:contain" />`
                    }
                    else {
                        img = ` <img src="/userIcon/No_Image.jpg" height="50px" width="50px" style="object-fit:contain" />`
                    }
                    table.append(`
                        <tr class="${data.p_status==false?'bg-secondary':''}">
                            <td>${index+1}</td> 
                            <td>${data.p_id}</td>
                            <td>${data.p_name ?? ""}</td>
                            <td>
                                ${img}
                            </td>
                            <td>${data.p_price ?? ""}</td>
                            <td>${data.p_discountPrice ?? ""}</td>
                            <td>${data.p_discription ?? ""}</td>
                            <td>${data.c_id ?? ""}</td>
                            <td>${data.subCat_id ?? ""}</td>
                            <td>
                                  <div class="form-check form-switch">
                                 <input class="form-check-input btn_ProductStatus" type="checkbox" role="switch" data-id="${data.p_id}" ${(data.p_status) == true ? 'checked' : '' }>
                                 </div>
                            </td>
                            <td>${data.p_addDate.split("T")[0] ?? ""}</td>
                            <td class='text-nowrap'>
                                   <button type="button" class="btn btn-success btn_EditProduct" data-id="${data.p_id}"><i class="fa-solid fa-wand-magic-sparkles"></i> </button>
                            <button type="button" value="Delete" class="btn btn-danger btn_DeleteProduct" data-id="${data.p_id}"><i class="fa-solid fa-trash-can"></i></button> 
                            </td>
                        </tr>
                    `)
                })
                
            } 

            $('#ProductTable').DataTable();
             
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }

    })
}


function ShowCartItems() {

    $.ajax({
        url: "/Products/ShowCartItems",
        type: "get",
        success: function (res) {
            if (res.success && res.totalCartItems > 0) {
                $("#cartBadgeItems").text(res.totalCartItems)

                var data = res.data; 
                var divId = $("#CartItems");
                 
                showAllProducts(data, divId)

            }
            else {
                $("#CartItems").empty().append("<h3>Please add item into cart to order!</h3>");
                $("#cartBadgeItems").text('0')

            }

        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }
    })
}

 

function showAllProducts(data, divId) {
    
    var showBtn = "";
    var img = ""; 
    divId.empty();
    $.each(data, function (index, UserData) {

        var btnDelete = "";

        if (divId.closest("#CartItemsOffcanvas").length > 0) {
           
            divStyle = '<div class="col-11 border border-1 p-1 rounded-3 shadow m-3">'

            if (UserData.cart_id) {
                btnDelete = ` <button type="button" class="btn btn-danger z-3 m-3 rounded-3 border border-1 p-2 top-0 end-0 position-absolute btn_deleteCartItems" data-id="${UserData.p_id}" ><i class="fa-solid fa-trash-can"></i></button>`
            }

            
        }
        else {
            divStyle = '<div class="col-6 col-lg-2 col-md-3 col-sm-4 mb-3">'
        }

        if (UserData.p_img != null) {
            img = `<img src="/Uploads/Products/${UserData.p_img}" class="card-img-top" height="150px" style="object-fit:contain;" alt="...">`
        }
        else {
            img = ` <img src="/userIcon/No_Image.jpg" class="card-img-top" height="150px" style="object-fit:contain" />`
        }

        if (UserData.p_quantity > 0) {
            showBtn = ` <div class="btn-group btn-group-sm btn_addItems" role="group" aria-label="Small button group">
                                      <button type="button" class="btn btn-outline-primary btn_left" data-id="${UserData.p_id}">-</button>
                                      <button type="button" class="btn btn-primary btn_center">${UserData.p_quantity}</button>
                                      <button type="button" class="btn btn-outline-primary btn_right" data-id="${UserData.p_id}">+</button>
                                    </div>
                     `
        }
        else {
            showBtn = ` <button type="button" class="btn-sm btn-outline-dark  form-control btn_cart" data-id="${UserData.p_id}">
                                        <i class="fa-solid fa-cart-shopping"></i>
                                    </button>
                    `
        }
         
        var disabledCard = "";
        var Overlay = "";
         
        if (UserData.p_status === false) {
            disabledCard = "pe-none opacity-50";
            Overlay = `<div class="position-absolute top-50 start-50 translate-middle badge bg-dark fs-6" style="z-index:5;">Sold-Out</div>`;
        }

        divId.append(`
                  ${divStyle}
                    <div class="card h-100 shadow-sm position-relative">
                        ${Overlay}
                        <div class="${disabledCard}">

                            ${img}

                            ${btnDelete}

                            <div class="card-body d-flex flex-column p-2">
                                <h5 class="card-title fs-6 mb-1 text-truncate" title="${UserData.p_name}">${UserData.p_name ?? ""}</h5>

                                <p class="card-text text-muted small mb-2 text-truncate" title="${UserData.p_discription}">
                                    ${UserData.p_discription ?? "&nbsp"}
                                </p>

                                <p class="card-text mb-1 small">
                                    Price: <span class="text-danger text-decoration-line-through"><i class="fa-solid fa-indian-rupee-sign"></i> ${UserData.p_price}</span>
                                    <strong class="text-success"><i class="fa-solid fa-indian-rupee-sign"></i> ${UserData.p_discountPrice}</strong>
                                </p>
                                <p class="card-text small mb-2">Discount: ${UserData.p_TotalDiscountInPercentage || 0} %</p>

                                <div class="row g-1 mt-auto pt-2">
                                    <div class="col-7 btn_PlusMinus">
                                       ${showBtn}
                                    </div>
                                    <div class="col-5">
                                        <button type="button"
                                                class="btn btn-outline-dark btn-sm w-100 px-0 d-flex align-items-center justify-content-center btn_buy"
                                                style="height: 31px;"
                                                data-id="${UserData.p_id}"
                                                data-name="${UserData.p_name}"
                                                data-price="${UserData.p_discountPrice}"
                                                data-qty="${UserData.p_quantity}">
                                           <i class="fa-brands fa-whatsapp"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                `)
    })

}

function selectAllPrdForLoggedInUser() {
    $.ajax({
        url: "/Products/selectAllPrdForLoggedInUser",
        type: "get",
        success: function (res) {
            if (res.success && res.data.length > 0) { 
                var divId = $("#AllProducts");
                var data = res.data;
                showAllProducts(data, divId);
                 
            }
            else {
                `<h3>No Product Found</h3>`
            }
        },
        error: function (xhr, status, error) {
            Swal.fire("Server Error", "Something went wrong, Please check your internet connection or Try Again Leter...!", "error")
            var err = JSON.parse(xhr.responseText)
            console.log(err)
        }

    })
}
 