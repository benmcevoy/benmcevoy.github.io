using System.Linq;

namespace Radio7.Portable.OpenTextSummarizer
{
    public class Summarizer
    {
        public static SummarizedDocument Summarize(SummarizerArguments args)
        {
            if (args == null) return null;

            var article = ParseDocument(args.InputString, args);

            Grader.Grade(article);
            Highlighter.Highlight(article, args);

            var sumdoc = CreateSummarizedDocument(article, args);

            return sumdoc;
        }

        private static SummarizedDocument CreateSummarizedDocument(Article article, SummarizerArguments args)
        {
            var sumDoc = new SummarizedDocument { Concepts = article.Concepts };

            foreach (var sentence in article.Sentences.Where(sentence => sentence.Selected))
            {
                sumDoc.Sentences.Add(sentence.OriginalSentence);
            }

            return sumDoc;
        }

        private static Article ParseDocument(string text, SummarizerArguments args)
        {
            var rules = Dictionary.LoadFromFile(args.DictionaryLanguage);
            var article = new Article(rules);

            article.ParseText(text);
            
            return article;
        }
    }
}
