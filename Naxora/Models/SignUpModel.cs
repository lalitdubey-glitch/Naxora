using Microsoft.AspNetCore.Authorization.Infrastructure;
using System.ComponentModel.DataAnnotations;

namespace Naxora.Models
{
    public class SignUpModel
    {
        public int?  U_id { get; set; }

        [StringLength(20), MinLength(3), Required]
        public string? name { get; set; }

        [EmailAddress, Required]
        public string? email { get; set; }

        [Required]
        public string? pass { get; set; }

        [Required]
        public string? pincode { get; set; }
        public string? state { get; set; }
        public string? dist { get; set; }
        public string? vill { get; set; } 

    }
}
