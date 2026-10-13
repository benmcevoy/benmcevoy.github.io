namespace Radio7.Portable.OpenTextSummarizer
{
    public class SummarizerArguments
    {
        public SummarizerArguments()
        {
            DictionaryLanguage = "en"; //default to english
            DisplayPercent = 10; //default to 10%
            InputString = string.Empty;
        }

        public string DictionaryLanguage { get; set; }
        
        public string InputString { get; set; }
        
        public int DisplayPercent { get; set; }
        
        public int DisplayLines { get; set; }
    }
}
