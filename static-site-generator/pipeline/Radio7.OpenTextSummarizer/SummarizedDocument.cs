using System.Collections.Generic;

namespace Radio7.Portable.OpenTextSummarizer
{
    public class SummarizedDocument
    {
        internal SummarizedDocument()
        {
            Sentences = new List<string>();
            Concepts = new List<string>();
        }

        public List<string> Concepts { get; set; }

        public List<string> Sentences { get; set; }
    }
}
