using System.Collections.Generic;

namespace Radio7.Portable.OpenTextSummarizer
{
    internal class Stemmer
    {
        internal static Word StemWord(string word, Dictionary rules)
        {
            word = word.ToLower();

            var newword = new Word
                {
                    TermFrequency = 1,
                    Value = StemFormat(word, rules),
                    Stem = StemStrip(word, rules)
                };

            return newword;
        }

        internal static string StemStrip(string word, Dictionary rules)
        {
            var originalWord = word;

            word = StemFormat(word, rules);
            word = ReplaceWord(word, rules.ManualReplacementRules);
            word = StripPrefix(word, rules.PrefixRules);
            word = StripSuffix(word, rules.SuffixRules);
            word = ReplaceWord(word, rules.SynonymRules);
            
            if (word.Length <= 2) word = StemFormat(originalWord, rules);
            
            return word;
        }

        internal static string StemFormat(string word, Dictionary rules)
        {
            word = StripPrefix(word, rules.Step1PrefixRules);
            word = StripSuffix(word, rules.Step1SuffixRules);

            return word;
        }

        private static string StripSuffix(string word, Dictionary<string, string> suffixRule)
        {
            //not simply using .Replace() in this method in case the 
            //rule.Key exists multiple times in the string.
            foreach (var rule in suffixRule)
            {
                if (word.EndsWith(rule.Key))
                {
                    word = word.Substring(0, word.Length - rule.Key.Length) + rule.Value;
                }
            }

            return word;
        }

        private static string ReplaceWord(string word, Dictionary<string, string> replacementRule)
        {
            foreach (var rule in replacementRule)
            {
                if (word == rule.Key)
                {
                    return rule.Value;
                }
            }

            return word;
        }

        private static string StripPrefix(string word, Dictionary<string, string> prefixRule)
        {
            //not simply using .Replace() in this method in case the 
            //rule.Key exists multiple times in the string.
            foreach (var rule in prefixRule)
            {
                if (word.StartsWith(rule.Key))
                {
                    word = rule.Value + word.Substring(rule.Key.Length);
                }
            }

            return word;
        }
    }
}
