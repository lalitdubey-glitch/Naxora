using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Naxora.Models;
using System.Data;
using System.Net.Http.Headers;

namespace Naxora.Controllers
{
    [Authorize(Roles ="admin")]
    public class AdminController : Controller
    {
        private readonly IDbLayer _dbLayer;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly IWebHostEnvironment _env;
        private readonly IImageResizerHelper _ImgResizer;

        public AdminController(IDbLayer dblayer, IConfiguration config, IEmailService emailService, IWebHostEnvironment env, IImageResizerHelper imgResizer)
        {
            _dbLayer = dblayer;
            _config = config;
            _emailService = emailService;
            _env = env;
            _ImgResizer = imgResizer;
        }
        public IActionResult Index()
        {
            return View();
        }

        public async Task<ActionResult> GetAllUsers()
        {
            try
            { 
                DataTable dt = await _dbLayer.Table("sp_SignUp", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"selectAllUser"), 
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

        public async Task<ActionResult> getOneUsersById(int? uid)
        {
            try
            { 
                DataTable dt = await _dbLayer.Table("sp_SignUp", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"selectOneUser"), 
                    new SqlParameter("@U_id" ,uid??(object)DBNull.Value), 
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
        public async Task<ActionResult> ChangeUserStatus(int? uid)
        {
            try
            {
                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_SignUp", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"ChangeStatus"), 
                    new SqlParameter("@U_id" ,uid??(object)DBNull.Value), 
                    msg
                });

                string? ResMsg = msg?.Value.ToString()??"";

                if (res > 0 && ResMsg== "StatusChanged")
                {
                    return Json(new { success = true, ms = ResMsg });
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
        public async Task<ActionResult> DeleteUser(int? uid)
        {
            try
            {
                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                int res = await _dbLayer.ExecuteQuery("sp_SignUp", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"delete"),
                    new SqlParameter("@U_id" ,uid??(object)DBNull.Value),
                    msg
                });

                string? ResMsg = msg?.Value.ToString() ?? "";

                if (res > 0 && ResMsg == "UserDeleted")
                {
                    return Json(new { success = true, ms = "userDeleted" });
                }

                return Json(new { success = false , ms = ResMsg});
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, ms = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> EditUserDetailsForAdminCrud(EditUserModel e)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, ms = "invalidData" });
                } 

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                await _dbLayer.ExecuteQuery("sp_SignUp", new SqlParameter[]
                 {
                        new SqlParameter("@action" , "UserEditForAdminCrud"),
                        new SqlParameter("@U_id" , e.uid ?? (object)DBNull.Value),
                        new SqlParameter("@U_name" , e.U_name ?? (object)DBNull.Value),
                        new SqlParameter("@pincode" , e.pincode ?? (object)DBNull.Value),
                        new SqlParameter("@state" , e.state ?? (object)DBNull.Value),
                        new SqlParameter("@dist" , e.dist ?? (object)DBNull.Value),
                        new SqlParameter("@vill" , e.vill ?? (object)DBNull.Value),
                        new SqlParameter("@Role" , e.role ?? (object)DBNull.Value),
                        msg
                 });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (ResMsg == "UserUpdated")
                {
                    return Json(new { success = true, ms = "userUpdated" });
                }

                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }


        }




    }
}
