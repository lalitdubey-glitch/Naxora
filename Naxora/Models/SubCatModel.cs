using System.ComponentModel.DataAnnotations;

namespace Naxora.Models
{
    public class SubCatModel
    {
        public int? sid { get; set; }

        [Required , MinLength(3), MaxLength(20)]
        public string? SubCatName { get; set; } 

        public IFormFile? SubCatImg { get; set; }

        [Required]
        public int? CatDDL1 { get; set; }
    }
}
