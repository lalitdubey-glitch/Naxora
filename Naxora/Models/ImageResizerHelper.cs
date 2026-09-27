using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Naxora.Models
{
    public class ImageResizerHelper : IImageResizerHelper
    {
        public async Task<string?> ResizeAndSaveImage(IFormFile? file, string targetFolder, int maxWidth = 800, int maxHeight = 800, int quality = 70)
        {
            if (file is not { Length: > 0 })
            {
                return null;
            }

            Directory.CreateDirectory(targetFolder);
            string uniqueName = $"{Guid.NewGuid()}.jpg";
            string fullPath = Path.Combine(targetFolder, uniqueName);

            using var stream = file.OpenReadStream();
            using var image = await Image.LoadAsync(stream);

            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(maxWidth, maxHeight)
            }));

            var encoder = new JpegEncoder { Quality = quality };
            await image.SaveAsJpegAsync(fullPath, encoder);

            return uniqueName;
        }
    }
}
