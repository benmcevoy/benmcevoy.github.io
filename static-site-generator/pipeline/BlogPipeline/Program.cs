using BlogPipeline.Publishing;

namespace BlogPipeline
{
    class Program
    {
        static void Main(string[] args)
        {
            new PublishPipeline().Run(CreateContext());
            Console.WriteLine("finished");
        }

        private static IDictionary<string, object> CreateContext()
        {
            return new Dictionary<string, object>(32);
        }
    }
}
