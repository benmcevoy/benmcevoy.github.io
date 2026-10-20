using System.Text;
using Pipes;

namespace BlogPipeline.Publishing
{
    class CreateSitemap : IFilter
    {
        private const string XmlHead = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";
        private const string XmlFoot = "</urlset>";

        public IDictionary<string, object> Run(IDictionary<string, object> context)
        {
            var posts = (List<PostToProcess>)context["posts"];
            var entries = posts.OrderByDescending(process => process.Meta.Published);
            var urls = new StringBuilder();

            urls.Append(XmlHead);

            foreach (var item in entries)
            {
                urls.Append($@"<url>
<loc>https://benmcevoy.com.au/blog/{item.RelativePath}</loc>
<lastmod>{item.Meta.Published:yyyy-MM-dd}</lastmod>
<changefreq>monthly</changefreq>
</url>");
            }

            urls.Append(XmlFoot);

            File.WriteAllText("published/sitemap.xml", urls.ToString());

            return context;
        }

    }
}