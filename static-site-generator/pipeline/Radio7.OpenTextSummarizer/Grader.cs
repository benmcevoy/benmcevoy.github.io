using System.Collections.Generic;
using System.Linq;

namespace Radio7.Portable.OpenTextSummarizer
{
    internal class Grader
    {
        public static void Grade(Article article)
        {
            CreateImportantWordsList(article);
                        
            GradeSentences(article);

            ExtractArticleConcepts(article);

            ApplySentenceFactors(article);
        }

        private static void ApplySentenceFactors(Article article)
        {
            //grade the first sentence of the article higher.
            article.Sentences[0].Score *= 2;

            //grade first sentence of new paragraphs (denoted by two \n in a row) higher
            foreach (var sentence in article.Sentences)
            {
                if (sentence.Words.Count < 2) continue;
                if (sentence.Words[0].Value.Contains("\n") && sentence.Words[1].Value.Contains("\n"))
                {
                    sentence.Score *= 1.6;
                }
            }
        }

        private static void ExtractArticleConcepts(Article article)
        {
            article.Concepts = new List<string> ();

            if (article.ImportantWords.Count > 5)
            {
                var baseFreq = article.ImportantWords[5].TermFrequency;
                article.Concepts = article.ImportantWords.Where(p => p.TermFrequency >= baseFreq).Select(p => p.Value).ToList();                
            }
            else
            {
                foreach (var word in article.ImportantWords)
                {
                    article.Concepts.Add(word.Value);
                }
            }
        }

        private static void GradeSentences(Article article)
        {
            foreach (var sentence in article.Sentences)
            {
                foreach (var word in sentence.Words)
                {
                    var wordstem = Stemmer.StemStrip(word.Value, article.Rules);
                    var importantWord = article.ImportantWords.SingleOrDefault(w => w.Stem == wordstem);

                    if (importantWord != null) sentence.Score++;
                }
            }
        }

        private static void CreateImportantWordsList(Article article)
        {
            var wordsArray = new Word[article.WordCounts.Count()];

            article.WordCounts.CopyTo(wordsArray);
            article.ImportantWords = new List<Word>(wordsArray);

            //IEnumerable<Word> results = article.ImportantWords.Except(article.Rules.UnimportantWords);
            foreach (var word in article.Rules.UnimportantWords)
            {
                var foundWord = article.ImportantWords.SingleOrDefault(w=> w.Value.ToLower() == word.Value.ToLower());
                
                if (foundWord != null) article.ImportantWords.Remove(foundWord);
            }
            //article.ImportantWords = new List<Word>(results);
            article.ImportantWords.Sort(CompareWordsByFrequency);
        }

        private static int CompareWordsByFrequency(Word lhs, Word rhs)
        {
            return rhs.TermFrequency.CompareTo(lhs.TermFrequency);
        }
    }
}
