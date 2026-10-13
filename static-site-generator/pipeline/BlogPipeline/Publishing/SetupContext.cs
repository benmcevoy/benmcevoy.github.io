using System.Collections.Generic;
using System.IO;
using System.Linq;
using Pipes;

namespace BlogPipeline.Publishing
{
    class SetupContext : IFilter
    {
        public IDictionary<string, object> Run(IDictionary<string, object> context)
        {
            var posts = new List<PostToProcess>(32);
            var paths = GetFilesToProcess("static/posts");

            posts.AddRange(paths.Select(CreatePost));

            context["posts"] = posts;
            
            return context;
        }

        private static IEnumerable<string> GetFilesToProcess(string path)
        {
            return Directory.GetDirectories(path);
        }

        private static PostToProcess CreatePost(string currentPath)
        {
            var meta = System.Text.Json.JsonSerializer.Deserialize<Meta>(File.ReadAllText(currentPath + "/meta.json"), System.Text.Json.JsonSerializerOptions.Web);

            var post = new PostToProcess
            {
                SourcePath = currentPath,
                BodyHtml = new Markdown("").Render(File.ReadAllText(currentPath + "/" + meta.Slug + ".md")),
                Meta = meta,
                RelativePath = string.Format("{0:yyyy}/{0:MM}/{1}/", meta.Published, meta.Slug)
            };

            return post;
        }
    }
}
