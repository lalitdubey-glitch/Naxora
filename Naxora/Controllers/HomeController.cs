using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Naxora.Models;
using BCrypt.Net;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace Naxora.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IDbLayer _dbLayer;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public HomeController(ILogger<HomeController> logger , IDbLayer dblayer , IConfiguration config, IEmailService emailServices)
        {
            _logger = logger;
            _dbLayer = dblayer;
            _config = config;
            _emailService = emailServices;
        }  

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult SignUp()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SignUp(SignUpModel s)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, ms = "Invalid_data" });
                }

                string? HashPass = null;

                if (s.pass != null)
                {
                    HashPass = BCrypt.Net.BCrypt.HashPassword(s.pass);
                }

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                string UserRole = User.IsInRole("admin") ? "admin" : "user";

                int res = await _dbLayer.ExecuteQuery("sp_SignUp", new SqlParameter[]
                {
                    new SqlParameter("@action" , "add"),
                    new SqlParameter("@U_name" , s.name ?? (object)DBNull.Value),
                    new SqlParameter("@email" , s.email ?? (object)DBNull.Value),
                    new SqlParameter("@HashPass" , HashPass ?? (object)DBNull.Value),
                    new SqlParameter("@pincode" , s.pincode ?? (object)DBNull.Value),
                    new SqlParameter("@state" , s.state ?? (object)DBNull.Value),
                    new SqlParameter("@dist" , s.dist ?? (object)DBNull.Value),
                    new SqlParameter("@vill" , s.vill ?? (object)DBNull.Value),
                    new SqlParameter("@status" , "1" ?? (object)DBNull.Value),
                    new SqlParameter("@Role" , UserRole ?? (object)DBNull.Value),
                    msg

                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (ResMsg == "EmailAlreadyExists")
                {
                    return Json(new { success = false, ms = ResMsg });
                }
                else if (ResMsg == "UserAdded")
                {
                    return Json(new { success = true, ms = ResMsg });
                }
                else
                {
                    return Json(new { success = false });
                }
            }
            catch(Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }
        }

        //This is for logged in user, user can change there detils. for crud 'admin/EditUserDetailsAdminCrud'
        [HttpPost]
        public async Task<ActionResult> EditUser(EditUserModel e)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, ms = "invalidData" });
                }

                if (string.IsNullOrWhiteSpace(User.FindFirst("UserId")?.Value))
                {
                    return Json(new { success = false, ms = "userNotLoggedIn" });
                }

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                await _dbLayer.ExecuteQuery("sp_SignUp", new SqlParameter[]
                 {
                        new SqlParameter("@action" , "edit"),
                        new SqlParameter("@U_id" , User.FindFirst("UserId")?.Value ?? (object)DBNull.Value),
                        new SqlParameter("@U_name" , e.U_name ?? (object)DBNull.Value),
                        new SqlParameter("@pincode" , e.pincode ?? (object)DBNull.Value),
                        new SqlParameter("@state" , e.state ?? (object)DBNull.Value),
                        new SqlParameter("@dist" , e.dist ?? (object)DBNull.Value),
                        new SqlParameter("@vill" , e.vill ?? (object)DBNull.Value),
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

        public async Task<IActionResult> Pincode(string? pincode)
        {
            try
            {
                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };
                 
                if (string.IsNullOrWhiteSpace(pincode))
                {
                    return Json(new { success = false });
                }

                DataTable dt = await _dbLayer.Table("sp_pincode", new SqlParameter[]
                {
                    new SqlParameter("@action","selectPincode"),
                    new SqlParameter("@pincode",pincode),
                    msg
                });

                string ResMsg = msg?.Value.ToString() ?? "";

                if(dt.Rows.Count > 0 || ResMsg == "PincodeFound")
                {
                    return Json(new { success = true, ms = ResMsg, data=dt});
                }
                return Json(new { success = false, ms = ResMsg });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }

        }

        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> Login(LoginModel l, string email,string pass)
        {
            try
            {
                string? HashPass = null;

                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(pass))
                {
                    return Json(new { success = false });
                }

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                DataTable dt = await _dbLayer.Table("sp_Login", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"SelectOneLogin"),
                    new SqlParameter("@email" ,email),
                    new SqlParameter("@HashPass" ,pass),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (dt.Rows.Count > 0 || ResMsg == "UserSeleted")
                {
                    HashPass = dt.Rows[0]["HashPass"].ToString()!;

                    bool isMatched = BCrypt.Net.BCrypt.Verify(pass, HashPass);

                    if (isMatched)
                    {
                        var claims = new List<Claim>
                        {
                            new Claim("UserId" , dt.Rows[0]["U_id"].ToString()!), 
                            new Claim(ClaimTypes.Role , dt.Rows[0]["Role"].ToString()!)
                        };

                        var identity = new ClaimsIdentity(claims,CookieAuthenticationDefaults.AuthenticationScheme);
                        await HttpContext.SignInAsync(new ClaimsPrincipal(identity));
                        
                        return Json(new { success = true });
                    }

                }

                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }
        }

        public async Task<ActionResult> GetLoggedInUser()
        {
            try
            { 

                SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                DataTable dt = await _dbLayer.Table("sp_SignUp", new SqlParameter[]
                {
                    new SqlParameter("@action" ,"selectOneUser"),
                    new SqlParameter("@U_id" , User.FindFirst("UserId")?.Value??(object)DBNull.Value),
                    msg
                });

                string ResMsg = msg.Value?.ToString() ?? "";

                if (dt.Rows.Count > 0 || ResMsg == "OneUserSelected")
                {
                    return Json(new { success = true, data = dt });
                }

                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> SendOTP(string email)
        {
            try
            { 
                var otp = new Random().Next(1000, 9999);

                bool isSent = false;

                string body = $@"<div>
                                    <h2>Your OTP is :  <span> {otp} </span> </h2>
                                <div>";

                if (!string.IsNullOrWhiteSpace(email))
                {
                    isSent = await _emailService.SendEmail(email, "Naxora Password Reset OTP", body);
                }

                if (isSent)
                {
                    HttpContext.Session.SetString("otp" , otp.ToString());
                    return Json(new { success = true });
                }
                return Json(new { success = false });

            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult VerifyOTP(string otp)
        {
            try
            {
                string sentOtp = HttpContext.Session.GetString("otp")!;

                if (!string.IsNullOrWhiteSpace(otp))
                {
                    if (otp == sentOtp)
                    {
                        HttpContext.Session.Remove("otp");
                        return Json(new { success = true });
                    }
                }

                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> ChangePass(string pass)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(pass))
                {
                    string hashPass = BCrypt.Net.BCrypt.HashPassword(pass);


                    SqlParameter msg = new SqlParameter("@msg", SqlDbType.NVarChar, 255)
                    {
                        Direction = ParameterDirection.Output
                    };

                    int res = await _dbLayer.ExecuteQuery("sp_SignUp", new SqlParameter[]
                     {
                        new SqlParameter("@action" , "ChangePassword"),
                        new SqlParameter("@HashPass" , hashPass),
                        new SqlParameter("@U_id" , User.FindFirst("UserId")?.Value??(object)DBNull.Value),
                        msg
                     });

                    string ResMsg = msg.Value?.ToString() ?? "";

                    if (res > 0 || ResMsg == "PasswordChanged")
                    {
                        return Json(new { success = true });
                    }
                }

                return Json(new { success = false });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { serverError = true, ms = ex.Message });
            }
        }

        public async Task<ActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
