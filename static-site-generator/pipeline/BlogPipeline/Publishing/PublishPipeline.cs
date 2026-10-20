using System.Collections.Generic;
using Pipes;

namespace BlogPipeline.Publishing
{
    class PublishPipeline  : IFilter
    {
        public IDictionary<string, object> Run(IDictionary<string, object> context)
        {
            var postProcessor = Pipeline.Create(new IFilter[]
            {
                new SetupContext(), 
                new CreateNavigationPartial(), 
                new ProcessPosts(),  
                new CreateHomePage(), 
                new CreateRssFeed(), 
                new CreateSitemap()
            });

            return postProcessor.Run(context);
        }
    }
}
