using System.Collections.Generic;
using System.IO;
using Pipes;

namespace BlogPipeline.Publishing
{
    class CreatePostPage : IFilter
    {
        private static readonly string PageTemplate;
        private static readonly string NavPartial;

        static CreatePostPage()
        {
            PageTemplate = File.ReadAllText("static/templates/page.html");
            NavPartial = File.ReadAllText("static/templates/_nav.html");
        }

        public IDictionary<string, object> Run(IDictionary<string, object> context)
        {
            var post = (PostToProcess)context["currentpost"];

            var html = PageTemplate.Replace("{{renderbody}}", post.BodyHtml);
            html = html.Replace("{{title}}", post.Meta.Title);
            html = html.Replace("{{keywords}}", post.Meta.Keywords);
            html = html.Replace("{{summary}}", post.Meta.Summary);
            html = html.Replace("{{published}}", post.Meta.Published.ToString("dddd MMMM yyyy"));
            html = html.Replace("{{nav}}", NavPartial);
            html = html.Replace("{{navigation}}", (string)context["navigation"]);

            File.WriteAllText(string.Format("{0}{1}.html", Path.Combine("published", post.RelativePath), "index"), html);

            return context;
        }
    }
}

