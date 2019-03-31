using TuesPechkin;
using System.Net;
using System.IO;
using Pechkin;

namespace PdfGen
{
    class Program
    {
        static void Main(string[] args)
        {
            var wc = new WebClient();
            var raw = wc.DownloadString("http://benmcevoy.com.au/resume.htm");

            byte[] pdf = new SimplePechkin(
                new Pechkin.GlobalConfig()).Convert(
                new Pechkin.ObjectConfig()
                    .SetLoadImages(true)
                    .SetPrintBackground(true)
                    .SetAllowLocalContent(true)
                    .SetScreenMediaType(true)
                    .SetCreateExternalLinks(true), raw);


            File.WriteAllBytes("resume.pdf", pdf);
        }
    }
}
