using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Xml.Linq;
using System.Reflection;

namespace Radio7.Portable.OpenTextSummarizer
{
    internal class Dictionary
    {
        public List<Word> UnimportantWords { get; set; }
        public List<string> LinebreakRules { get; set; }
        public List<string> NotALinebreakRules { get; set; }
        public List<string> DepreciateValueRule { get; set; }
        public List<string> TermFreqMultiplierRule { get; set; }

        //the replacement rules are stored as KeyValuePair<string,string>s 
        //the Key is the search term. the Value is the replacement term
        public Dictionary<string, string> Step1PrefixRules { get; set; }
        public Dictionary<string, string> Step1SuffixRules { get; set; }
        public Dictionary<string, string> ManualReplacementRules { get; set; }
        public Dictionary<string, string> PrefixRules { get; set; }
        public Dictionary<string, string> SuffixRules { get; set; }
        public Dictionary<string, string> SynonymRules { get; set; }
        public string Language { get; set; }

        private Dictionary() { }

        [SuppressMessage("Microsoft.Usage", "CA2202:Do not dispose objects multiple times")]
        private static string GetResource(string resourceName)
        {
            var assembly = Assembly.GetExecutingAssembly();

            using (var stream = assembly.GetManifestResourceStream(resourceName))
            {
                if (stream != null)
                {
                    using (var reader = new StreamReader(stream))
                    {
                        return reader.ReadToEnd();
                    }
                }
            }

            return "";
        }

        public static Dictionary LoadFromFile(string dictionaryLanguage)
        {
            var dictionaryFile = string.Format(@"Radio7.Portable.OpenTextSummarizer.Dictionaries.{0}.xml",
                                                  dictionaryLanguage);

            var dictionary = GetResource(dictionaryFile);

            if (string.IsNullOrEmpty(dictionary))
            {
                throw new FileNotFoundException("Could Not Load Dictionary: " + dictionaryFile);
            }

            var dict = new Dictionary();
            var doc = XElement.Parse(dictionary);

            dict.Step1PrefixRules = LoadKeyValueRule(doc, "stemmer", "step1_pre");
            dict.Step1SuffixRules = LoadKeyValueRule(doc, "stemmer", "step1_post");
            dict.ManualReplacementRules = LoadKeyValueRule(doc, "stemmer", "manual");
            dict.PrefixRules = LoadKeyValueRule(doc, "stemmer", "pre");
            dict.SuffixRules = LoadKeyValueRule(doc, "stemmer", "post");
            dict.SynonymRules = LoadKeyValueRule(doc, "stemmer", "synonyms");
            dict.LinebreakRules = LoadValueOnlyRule(doc, "parser", "linebreak");
            dict.NotALinebreakRules = LoadValueOnlyRule(doc, "parser", "linedontbreak");
            dict.DepreciateValueRule = LoadValueOnlyRule(doc, "grader-syn", "depreciate");
            dict.TermFreqMultiplierRule = LoadValueOnlySection(doc, "grader-tf");
            dict.UnimportantWords = new List<Word>();

            var unimpwords = LoadValueOnlySection(doc, "grader-tc");
            
            foreach (var unimpword in unimpwords)
            {
                dict.UnimportantWords.Add(new Word(unimpword));
            }
            
            return dict;
        }

        private static List<string> LoadValueOnlySection(XElement doc, string section)
        {
            var list = new List<string>();
            var step1Pre = doc.Elements(section);
            foreach (var x in step1Pre.Elements())
            {
                list.Add(x.Value);
            }
            return list;
        }

        private static List<string> LoadValueOnlyRule(XElement doc, string section, string container)
        {
            var list = new List<string>();
            var step1Pre = doc.Elements(section).Elements(container);
            foreach (var x in step1Pre.Elements())
            {
                list.Add(x.Value);
            }
            return list;
        }

        private static Dictionary<string, string> LoadKeyValueRule(XElement doc, string section, string container)
        {
            var dictionary = new Dictionary<string, string>();
            var step1Pre = doc.Elements(section).Elements(container);
            foreach (var x in step1Pre.Elements())
            {
                string rule = x.Value;
                string[] keyvalue = rule.Split('|');
                if (!dictionary.ContainsKey(keyvalue[0]))
                    dictionary.Add(keyvalue[0], keyvalue[1]);
            }
            return dictionary;
        }

    }
}
