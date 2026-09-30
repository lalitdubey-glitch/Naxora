using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Naxora.Models;
using System.Net.NetworkInformation;
using System.Threading.Tasks;
using System.IO;
using Microsoft.Data;
using Microsoft.Data.SqlClient;
using System.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Security.Cryptography.Xml;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace Naxora.Controllers
{
   [Authorize(Roles ="admin")]
    public class ProductsController : Controller
    {
        private readonly IDbLayer _dbLayer;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly IWebHostEnvironment _env;
        private readonly IImageResizerHelper _ImgResizer;

        public ProductsController(IDbLayer dbLayer, IEmailService emailService, IConfiguration config, IWebHostEnvironment env, IImageResizerHelper imgResizer)
        {
            _dbLayer = dbLayer;
            _emailService = emailService;
            _config = config;
            _env = env;
            _ImgResizer = imgResizer;
        }
        public IActionResult Index()
        {
            return View();
        }

        //-----------Category

        public IActionResult Category()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddEditCategory(CategoryModel c)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false });
                }

                string folder = Path.Combine(_env.WebRootPath, "Uploads", "Categories");
                string? pic = await _ImgResizer.ResizeAndSaveImage(c.CatImg, folder, 400, 400);

                string? action = c.c_id.HasValue ? "edit" : "add";


                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Category", new SqlParameter[]
                {
                new SqlParameter("@action" , action),
                new SqlParameter("@c_id" , c.c_id ?? (object)DBNull.Value),
                new SqlParameter("@c_name" , c.c_name ?? (object)DBNull.Value),
                new SqlParameter("@c_img" , pic ?? (object)DBNull.Value),
                new SqlParameter("@c_status" , "1"),
                msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (ResMsg == "alreadyExists")
                {
                    return Json(new { success = false, ms = ResMsg });
                }
                else if (res > 0 && (ResMsg == "catAdded" || ResMsg == "catUpdated"))
                {
                    return Json(new { success = true, ms = ResMsg });
                }
                else
                {
                    return Json(new { success = false, ms = ResMsg });
                }
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [AllowAnonymous]
        public async Task<ActionResult> GetAllCategory()
        {
            try
            {
                DataTable dt = await _dbLayer.Table("sp_Category", new SqlParameter[]
                {
                new SqlParameter("@action" , "selectAllCat")
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }

        public async Task<ActionResult> getCatById(int? cid)
        {
            try
            {
                DataTable dt = await _dbLayer.Table("sp_Category", new SqlParameter[]
                {
                new SqlParameter("@action" , "selectOneCat"),
                new SqlParameter("@c_id" , cid ?? (object)DBNull.Value)
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }

        [HttpPost]
        public async Task<ActionResult> deleteCategory(int? cid)
        {
            try
            {

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Category", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"deleteCat"),
                    new SqlParameter("@c_id" ,cid??(object)DBNull.Value),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (res > 0 && ResMsg == "catDeleted")
                {
                    return Json(new { success = true, ms = ResMsg });
                }

                return Json(new { success = false, ms = ResMsg });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> changeCategoryStatus(int? cid)
        {
            try
            {

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Category", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"changeStatus"),
                    new SqlParameter("@c_id" ,cid??(object)DBNull.Value), 
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (res > 0 && ResMsg == "statusChanged")
                {
                    return Json(new { success = true, ms = ResMsg });
                }

                return Json(new { success = false, ms = ResMsg });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, ms = ex.Message });
            }
        }

        //------------Sub Category

        public ActionResult SubCategory()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddEditSubCategory(SubCatModel sc)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, ms = "fillAllFields" });
                }

                string folder = Path.Combine(_env.WebRootPath, "Uploads", "SubCategory");
                string? pic = await _ImgResizer.ResizeAndSaveImage(sc.SubCatImg, folder, 400, 400);

                string action = sc.sid.HasValue ? "edit" : "add";

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_SubCategory", new SqlParameter[]
                {
                    new SqlParameter("@action" , action),
                    new SqlParameter("@subCat_id" , sc.sid ?? (object)DBNull.Value),
                    new SqlParameter("@subCat_name" , sc.SubCatName ?? (object)DBNull.Value),
                    new SqlParameter("@c_id" , sc.CatDDL1 ?? (object)DBNull.Value),
                    new SqlParameter("@subCat_img" , pic ?? (object)DBNull.Value),
                    new SqlParameter("@subCat_status" , "1"),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (ResMsg == "alreadyExists")
                {
                    return Json(new { success = false, ms = ResMsg });
                }
                else if (res > 0 && (ResMsg == "subCatAdded" || ResMsg == "subCatUpdated"))
                {
                    return Json(new { success = true, ms = ResMsg });
                }
                else
                {
                    return Json(new { success = false, ms = ResMsg });
                }
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [AllowAnonymous]
        public async Task<ActionResult> GetAllSubCatByCategoryId(int? c_id)
        {
            try
            {
                DataTable dt = await _dbLayer.Table("sp_SubCategory", new SqlParameter[]
                {
                new SqlParameter("@action" , "selectAllSubCatByCatId"),
                new SqlParameter("@c_id" , c_id)
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }

        [AllowAnonymous]
        public async Task<ActionResult> GetAllSubCategory()
        {
            try
            {
                DataTable dt = await _dbLayer.Table("sp_SubCategory", new SqlParameter[]
                {
                new SqlParameter("@action" , "selectAllSubCat")
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }


        public async Task<ActionResult> getOneSubCatById(int? sid)
        {
            try
            { 
                DataTable res = await _dbLayer.Table("sp_SubCategory", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"selectOneSubCat"),
                    new SqlParameter("@subCat_id" ,sid??(object)DBNull.Value), 
                }); 

                if (res.Rows.Count>0)
                {
                    return Json(new { success = true, data = res });
                }

                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> deleteSubCategory(int? sid)
        {
            try
            {

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_SubCategory", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"deleteSubCat"),
                    new SqlParameter("@subCat_id" ,sid??(object)DBNull.Value),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (res > 0 && ResMsg == "subCatDeleted")
                {
                    return Json(new { success = true, ms = ResMsg });
                }

                return Json(new { success = false, ms = ResMsg });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> changeSubCatStatus(int? sid)
        {
            try
            {

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_SubCategory", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"changeStatus"),
                    new SqlParameter("@subCat_id" ,sid??(object)DBNull.Value),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (res > 0 && ResMsg == "statusChanged")
                {
                    return Json(new { success = true, ms = ResMsg });
                }

                return Json(new { success = false, ms = ResMsg });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, ms = ex.Message });
            }
        }

        // ----------Products

        public ActionResult Products()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddEditProduct(ProductModel p)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, ms = "FillAllFields" });
                }

                string folder = Path.Combine(_env.WebRootPath, "Uploads", "Products");
                string? pic = await _ImgResizer.ResizeAndSaveImage(p.ProductImg, folder, 400, 400);

                string action = p.pid.HasValue ? "edit" : "add";

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Products", new SqlParameter[]
                {
                    new SqlParameter("@action" , action),
                    new SqlParameter("@p_id" , p.pid ?? (object)DBNull.Value),
                    new SqlParameter("@p_name" , p.p_name ?? (object)DBNull.Value),
                    new SqlParameter("@p_price" , p.p_price ?? (object)DBNull.Value),
                    new SqlParameter("@p_discountPrice" , p.p_discountPrice ?? (object)DBNull.Value),
                    new SqlParameter("@p_TotalDiscountInPercentage" , p.Show_p_discountPrice ?? (object)DBNull.Value),
                    new SqlParameter("@p_discription" , p.p_discription ?? (object)DBNull.Value),
                    new SqlParameter("@c_id" , p.CatDDL2 ?? (object)DBNull.Value),
                    new SqlParameter("@subCat_id" , p.SubCatDDL ?? (object)DBNull.Value),
                    new SqlParameter("@p_img" , pic ?? (object)DBNull.Value),
                    new SqlParameter("@p_status" , "1"),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (res > 0 && (ResMsg == "prdAdded") || ResMsg== "editedPrd")
                {
                    return Json(new { success = true, ms = ResMsg });
                }
                else
                {
                    return Json(new { success = false, ms = ResMsg });
                }
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [AllowAnonymous]
        public async Task<ActionResult> selectAllPrdForLoggedInUser()
        {
            try
            { 
                int? UserId = Convert.ToInt32(User.FindFirst("UserId")?.Value ?? "0");

                DataTable dt = await _dbLayer.Table("sp_Products", new SqlParameter[]
                {
                new SqlParameter("@action" , "selectAllPrdForLoggedInUser"),
                new SqlParameter("@U_id" , UserId ?? (object)DBNull.Value), 
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex) 
            {
                Response.StatusCode = 500;
                return Json(new { success = false , ms = ex.Message });
            }

        }

        public async Task<ActionResult> GetAllProductForCrud()
        {
            try
            {  

                DataTable dt = await _dbLayer.Table("sp_Products", new SqlParameter[]
                {
                    new SqlParameter("@action" , "selectAllPrdForAdminCrud"), 
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex) 
            {
                Response.StatusCode = 500;
                return Json(new { success = false , ms = ex.Message });
            }

        }

        public async Task<ActionResult> GetOneProductById(int? pid)
        {
            try
            { 

                DataTable dt = await _dbLayer.Table("sp_Products", new SqlParameter[]
                {
                new SqlParameter("@action" , "selectOnePrd"),
                new SqlParameter("@p_id" , pid?? (object)DBNull.Value),
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }

        [HttpPost]
        public async Task<ActionResult> DeleteProduct(int? pid)
        {
            try
            {
                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Products", new SqlParameter[]
                {
                new SqlParameter("@action" , "deletePrd"),
                new SqlParameter("@p_id" , pid?? (object)DBNull.Value),
                msg
                });

                string? ResMsg = msg?.Value.ToString() ?? "";

                if (res > 0)
                {
                    return Json(new { success = true ,ms = ResMsg });
                }
                return Json(new { success = false , ms=ResMsg});
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }

        [HttpPost]
        public async Task<ActionResult> ChangeProductStatus(int? pid)
        {
            try
            {

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Products", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"changeStatus"),
                    new SqlParameter("@p_id" ,pid??(object)DBNull.Value),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (res > 0 && ResMsg == "statusChanged")
                {
                    return Json(new { success = true, ms = ResMsg });
                }

                return Json(new { success = false, ms = ResMsg });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [AllowAnonymous]
        public async Task<ActionResult> getAllProductdBySubCatId(int? sid)
        {
            try
            {

                DataTable dt = await _dbLayer.Table("sp_Products", new SqlParameter[]
                {
                    new SqlParameter("@action" , "selectAllProductdBySubCatId"),
                    new SqlParameter("@subCat_id" , sid?? (object)DBNull.Value),
                    new SqlParameter("@U_id" , User.FindFirst("UserId")?.Value?? (object)DBNull.Value),
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }

        [AllowAnonymous]
        public async Task<ActionResult> getAllProductdByCatId(int? cid)
        {
            try
            {

                DataTable dt = await _dbLayer.Table("sp_Products", new SqlParameter[]
                {
                    new SqlParameter("@action" , "selectAllProductdByCatId"),
                    new SqlParameter("@c_id" , cid?? (object)DBNull.Value),
                    new SqlParameter("@U_id" , User.FindFirst("UserId")?.Value?? (object)DBNull.Value),
                });

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }

        }

        //------------Cart

        [HttpPost, AllowAnonymous]
        public async Task<ActionResult> AddCart(int? p_id)
        {
            try
            {
                int? userId = Convert.ToInt32(User.FindFirst("UserId")?.Value?? "0");

                SqlParameter CartCount = new SqlParameter("@CountCartItem", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                }; 
                SqlParameter QuantityOfThisProduct = new SqlParameter("@TotalProducts", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                }; 

                int res = await _dbLayer.ExecuteQuery("sp_Cart", new SqlParameter[]
                {
                    new SqlParameter("@action" , "add"),
                    new SqlParameter("@U_id" , userId ??(object)DBNull.Value ),
                    new SqlParameter("@p_id" , p_id??(object)DBNull.Value),
                    new SqlParameter("@p_quantity" , "1"),
                    new SqlParameter("@status" , "1"),
                    CartCount,
                    QuantityOfThisProduct

                });
                 
                int TotalCartItems = CartCount?.Value == DBNull.Value ? 0 : Convert.ToInt32(CartCount?.Value ?? 0);
                int ProductQuantity = QuantityOfThisProduct?.Value == DBNull.Value ? 0 : Convert.ToInt32(QuantityOfThisProduct?.Value ?? 0);

                if (res > 0)
                {
                    return Json(new { success = true , userId  = userId , totalCartItems= TotalCartItems, productQuantity = ProductQuantity });
                }
                return Json(new { success = false});
            }
            catch(Exception ex)
            {
                Response.StatusCode=500;
                return Json(new { success = false, ms = ex.Message});
            }
        }

        [AllowAnonymous]
        public async Task<ActionResult> ShowCartItems()
        {
            try
            {
                int? userId = Convert.ToInt32(User.FindFirst("UserId")?.Value ?? "0");

                SqlParameter CartCount = new SqlParameter("@CountCartItem", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                DataTable dt = await _dbLayer.Table("sp_Cart", new SqlParameter[]
                {
                    new SqlParameter("@action" , "selectAllCart"),
                    new SqlParameter("@U_id" , userId ??(object)DBNull.Value ),
                    CartCount,
                });

                int? TotalCartItems = Convert.ToInt32(CartCount?.Value ?? 0);

                if (dt.Rows.Count > 0)
                {
                    return Json(new { success = true, data = dt, TotalCartItems = TotalCartItems });
                }
                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [HttpPost , AllowAnonymous]
        public async Task<ActionResult> OrderAll()
        {
            try
            {
                int? userId = Convert.ToInt32(User.FindFirst("UserId")?.Value??"0");

                int res = await _dbLayer.ExecuteQuery("sp_Cart", new SqlParameter[]
                {
                    new SqlParameter("@action" , "OrderAll"),
                    new SqlParameter("@U_id" , userId ??(object)DBNull.Value ),  

                });

                if (res > 0)
                {
                    return Json(new { success = true });
                }
                return Json(new { success = false});
            }
            catch(Exception ex)
            {
                Response.StatusCode=500;
                return Json(new { success = false, ms = ex.Message});
            }
        }
      
        [HttpPost , AllowAnonymous]
        public async Task<ActionResult> DeleteProductFromCart(int? pid)
        {
            try
            {
                int? userId = Convert.ToInt32(User.FindFirst("UserId")?.Value??"0");

                SqlParameter CartCount = new SqlParameter("@CountCartItem", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                SqlParameter QuantityOfThisProduct = new SqlParameter("@TotalProducts", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Cart", new SqlParameter[]
                {
                    new SqlParameter("@action" , "deleteCartItem"),
                    new SqlParameter("@U_id" , userId ??(object)DBNull.Value ), 
                    new SqlParameter("@p_id" , pid??(object)DBNull.Value), 
                    CartCount,
                    QuantityOfThisProduct

                });

                int TotalCartItems = CartCount?.Value == DBNull.Value ? 0 : Convert.ToInt32(CartCount?.Value ?? 0);
                int ProductQuantity = QuantityOfThisProduct?.Value == DBNull.Value ? 0 : Convert.ToInt32(QuantityOfThisProduct?.Value ?? 0);

                if (res > 0)
                {
                    return Json(new { success = true , TotalCartItems= TotalCartItems, productQuantity = ProductQuantity });
                }
                return Json(new { success = false});
            }
            catch(Exception ex)
            {
                Response.StatusCode=500;
                return Json(new { success = false, ms = ex.Message});
            }
        }

        [HttpPost , AllowAnonymous]
        public async Task<ActionResult> BtnMinus(int? p_id)
        {
            try
            {
                int? userId = Convert.ToInt32(User.FindFirst("UserId")?.Value??"0");

                SqlParameter CartCount = new SqlParameter("@CountCartItem", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                SqlParameter QuantityOfThisProduct = new SqlParameter("@TotalProducts", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_Cart", new SqlParameter[]
                {
                    new SqlParameter("@action" , "minus"),
                    new SqlParameter("@U_id" , userId ??(object)DBNull.Value ), 
                    new SqlParameter("@p_id" , p_id??(object)DBNull.Value), 
                    CartCount,
                    QuantityOfThisProduct

                });
                 
                int TotalCartItems = CartCount?.Value == DBNull.Value ? 0 : Convert.ToInt32(CartCount?.Value ?? 0);
                int ProductQuantity = QuantityOfThisProduct?.Value == DBNull.Value ? 0 : Convert.ToInt32(QuantityOfThisProduct?.Value ?? 0);

                if (res > 0)
                {
                    return Json(new { success = true , totalCartItems= TotalCartItems, productQuantity = ProductQuantity });
                }
                return Json(new { success = false});
            }
            catch(Exception ex)
            {
                Response.StatusCode=500;
                return Json(new { success = false, ms = ex.Message});
            }
        }

        
    }
}
