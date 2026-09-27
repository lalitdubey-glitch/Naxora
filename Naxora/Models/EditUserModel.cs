using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Naxora.Models
{
    public class EditUserModel
    { 
        public int? uid {  get; set; }

        [Required, MaxLength(50), MinLength(3)]
        public string? U_name { get; set; }

        [Required, MinLength(6)]
        public string? pincode { get; set; }
        public string? state { get; set; }
        public string? dist { get; set; }
        public string? vill { get; set; }
        public string? role { get; set; }
    }
}
