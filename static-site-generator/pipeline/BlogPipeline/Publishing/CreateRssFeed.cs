using System.ServiceModel.Syndication;
using System.Xml;
using Pipes;

namespace BlogPipeline.Publishing
{
    class CreateRssFeed : IFilter
    {
        public IDictionary<string, object> Run(IDictionary<string, object> context)
        {
            var posts = (List<PostToProcess>)context["posts"];

            const string path = "published/feed/";

            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }

            var entries = posts.OrderByDescending(process => process.Meta.Published).Take(10);

            CreateFeed(entries);

            return context;
        }

        private static void CreateFeed(IEnumerable<PostToProcess> entries)
        {
            var feed = new SyndicationFeed("Ben McEvoy", "Just stuff for fun", new Uri("https://benmcevoy.com.au/blog/feed"), "https://benmcevoy.com.au/blog/feed", DateTime.Now);
            var items = new List<SyndicationItem>();

            foreach (var post in entries)
            {
                var url = new Uri("https://benmcevoy.com.au/blog/" + post.RelativePath.Replace(@"\\", "/"), UriKind.Absolute);

                var entry = new SyndicationItem(
                    post.Meta.Title,
                    new TextSyndicationContent(post.BodyHtml, TextSyndicationContentKind.Html),
                    url,
                    url.ToString(),
                    post.Meta.Published
                    );

                entry.PublishDate = post.Meta.Published;

                items.Add(entry);
            }

            feed.Authors.Add(new SyndicationPerson { Name = "Ben McEvoy" });
            feed.Items = items;
            feed.Language = "en-us";
            feed.LastUpdatedTime = DateTime.Now;
            feed.Links.Add(SyndicationLink.CreateSelfLink(new Uri("https://benmcevoy.com.au/blog/feed"), "application/atom+xml"));

            var atomWriter = XmlWriter.Create("published/feed/atom.xml");
            var atomFormatter = new Atom10FeedFormatter(feed);
            atomFormatter.WriteTo(atomWriter);
            atomWriter.Close();
        }
    }
}
