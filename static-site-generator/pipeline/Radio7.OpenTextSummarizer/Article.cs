using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Radio7.Portable.OpenTextSummarizer
{
    internal class Article
    {
        public List<Sentence> Sentences { get; set; }
        public int LineCount { get; set; }
        public List<string> Concepts { get; set; }
        public Dictionary Rules { get; set; }

        public List<Word> ImportantWords { get; set; }
        public List<Word> WordCounts { get; set; }


        public Article(Dictionary rules) { 
            Sentences = new List<Sentence>();
            WordCounts = new List<Word>();
            Concepts = new List<string>();
            Rules = rules;
        }

        public void ParseText(string text)
        {
            var words = text.Split(' ', '\r'); //space and line feed characters are the ends of words.
            var cursentence = new Sentence();
            var originalSentence = new StringBuilder();

            Sentences.Add(cursentence);

            foreach (var word in words)
            {
                var locWord = word;

                if (string.IsNullOrWhiteSpace(locWord)) continue;

                if (locWord.StartsWith("\n") && word.Length > 2) locWord = locWord.Replace("\n", "");
                if (locWord.StartsWith("\t") && word.Length > 2) locWord = locWord.Replace("\t", "");

                originalSentence.AppendFormat("{0} ", locWord);
                cursentence.Words.Add(new Word(locWord));

                AddWordCount(locWord);

                if (!IsSentenceBreak(locWord)) continue;

                cursentence.OriginalSentence = originalSentence.ToString();
                cursentence = new Sentence();
                originalSentence = new StringBuilder();
                Sentences.Add(cursentence);
            }
        }

        private void AddWordCount(string word)
        {
            var stemmedWord = Stemmer.StemWord(word, Rules);

            if (string.IsNullOrEmpty(word) || word == " " || word == "\n" || word == "\t") return;
            
            var foundWord = WordCounts.SingleOrDefault(w => w.Stem == stemmedWord.Stem);
            
            if (foundWord == null)
            {
                WordCounts.Add(stemmedWord);
            }
            else
            {
                foundWord.TermFrequency++;
            }
        }

        private bool IsSentenceBreak(string word)
        {
            if (word.Contains("\r") || word.Contains("\n")) return true;

            var shouldBreak = (Rules.LinebreakRules.Any(p => word.EndsWith(p, StringComparison.CurrentCultureIgnoreCase)));

            if (shouldBreak == false) return false;

            return (!Rules.NotALinebreakRules.Any(p => word.StartsWith(p, StringComparison.CurrentCultureIgnoreCase)));
        }
    }
}
