using Markdig;
using Markdown.ColorCode;
using Pipes;

namespace BlogPipeline.Publishing
{
    class SetupContext : IFilter
    {
        private static MarkdownPipeline  _markdownPipeline = new MarkdownPipelineBuilder()
                            .UseAdvancedExtensions()
                            .UseYamlFrontMatter()
                            .UseColorCode()
                            .DisableHtml()
                            .Build();
        
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
            var document = Markdig.Markdown.Parse(File.ReadAllText(currentPath + "/" + meta!.Slug + ".md"), _markdownPipeline);

            var post = new PostToProcess
            {
                SourcePath = currentPath,
                BodyHtml = document.ToHtml(_markdownPipeline),
                Meta = meta,
                RelativePath = string.Format("{0:yyyy}/{0:MM}/{1}/", meta.Published, meta.Slug)
            };

            return post;
        }
    }
}
