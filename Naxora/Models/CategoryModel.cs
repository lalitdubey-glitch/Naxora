using System.ComponentModel.DataAnnotations;

namespace Naxora.Models
{
    public class CategoryModel
    {
        public int? c_id { get; set; }

        [Required]
        public string? c_name { get; set; } 
        public bool? c_status { get; set; } 
        public IFormFile? CatImg { get; set; } 
    }
}
