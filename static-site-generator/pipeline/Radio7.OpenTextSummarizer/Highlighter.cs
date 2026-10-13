using System.Linq;

namespace Radio7.Portable.OpenTextSummarizer
{
    internal class Highlighter
    {
        internal static void Highlight(Article article, SummarizerArguments args)
        {
            if (args.DisplayPercent == 0 && args.DisplayLines == 0) return;
            if (args.DisplayPercent == 0)
            {
                //get the highest scored n lines, without reordering the list.
                SelectNumberOfSentences(article, args.DisplayLines);
            }
            else
            {
                SelectSentencesByPercent(article, args.DisplayPercent);
            }
        }

        private static void SelectSentencesByPercent(Article article, int percent)
        {
            if(percent > 100) percent = 100;
            if(percent < 1) percent = 1;

            var sentencesByScore = article.Sentences.OrderByDescending(p => p.Score).Select(p => p);
            var totalWords = article.Sentences.Sum(p => p.Words.Count());
            var maxWords = (int) (totalWords*(percent/100f));
            var wordsCount = 0;

            foreach (var sentence in sentencesByScore)
            {
                if (sentence.OriginalSentence == null) continue;

                sentence.Selected = true;
                wordsCount += sentence.Words.Count();

                if (wordsCount >= maxWords) break;
            }
        }

        private static void SelectNumberOfSentences(Article article, int lineCount)
        {
            var sentencesByScore = article.Sentences.OrderByDescending(p => p.Score).Select(p => p);
            int loopCounter = 0;

            foreach (var sentence in sentencesByScore)
            {
                if (sentence.OriginalSentence == null) continue;
                sentence.Selected = true;
                loopCounter++;
                if (loopCounter >= lineCount) break;
            }
        }
    }
}
