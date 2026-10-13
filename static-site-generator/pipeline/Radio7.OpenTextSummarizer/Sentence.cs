using System.Collections.Generic;

namespace Radio7.Portable.OpenTextSummarizer
{
    internal class Sentence
    {
        public Sentence()
        {
            Words = new List<Word>();
            Selected = false;
        }

        public List<Word> Words { get; set; }

        public double Score { get; set; }

        public bool Selected { get; set; }

        public int WordCount { get; set; }

        public string OriginalSentence { get; set; }
    }
}
