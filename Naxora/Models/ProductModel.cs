using System.ComponentModel.DataAnnotations;

namespace Naxora.Models
{
    public class ProductModel
    {
        public int? pid { get; set; }

        [Required, MinLength(3) , MaxLength(20)]
        public string? p_name { get; set; }

        [Required]
        public decimal? p_price { get; set; }

        [Required]
        public decimal? p_discountPrice { get; set; }

        [Required]
        public decimal? Show_p_discountPrice { get; set; }

        public string? p_discription { get; set; }

        public IFormFile? ProductImg { get; set; }

        [Required]
        public int? CatDDL2 { get; set; }

        [Required]
        public int? SubCatDDL { get; set; }
    }
}
