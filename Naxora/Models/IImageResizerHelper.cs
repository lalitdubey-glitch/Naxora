
namespace Naxora.Models
{
    public interface IImageResizerHelper
    {
        Task<string?> ResizeAndSaveImage(IFormFile? file, string targetFolder, int maxWidth = 800, int maxHeight = 800, int quality = 70);
    }
}