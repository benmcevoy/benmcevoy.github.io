using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net;
using Newtonsoft.Json.Converters;
using System.Xml;
using Newtonsoft.Json;

namespace benmcevoy.projects
{
    /// <summary>
    /// Summary description for GoogleWeather1
    /// </summary>
    public class WeatherProxy : IHttpHandler
    {
        private HttpContext _context;
        private readonly string _googleWeatherUrl = "http://www.google.com/ig/api?weather={0}";
        private readonly string _googleGeoCodeUrl = "http://maps.googleapis.com/maps/api/geocode/xml?latlng={0}&sensor=false";
       
        public void ProcessRequest(HttpContext context)
        {
            _context = context;
            var callback = _context.Request.QueryString["callback"];

            if (_context.Request.QueryString["ll"] == null)
            {
                WriteJsonResponse(callback, ToJson(GetWeather("melbourne")));
            }

            var latlon = _context.Request.QueryString["ll"];
            var location = LookupCity(latlon);
            var weatherXML = GetWeather(location);
            var weatherJSON = ToJson(weatherXML);

            WriteJsonResponse(callback, weatherJSON);
        }

        private string LookupCity(string latlon)
        {
            // Ensure that no space exists between the latitude and longitude values when passed in the latlng parameter.
            latlon = latlon.Replace(" ", "");

            var xml = "";

            using (var wc = new WebClient())
            {
                xml = wc.DownloadString(string.Format(_googleGeoCodeUrl, latlon));
            }

            // if we were good there would be an object model we could serialize into
            // or we would use some existing google geo code library.
            // I'm sure there are many
            XmlDocument doc = new XmlDocument();
            
            doc.LoadXml(xml);

            // can you say nasty?
            return doc.ChildNodes[1].ChildNodes[1].ChildNodes[4].FirstChild.InnerText;
        }

        private string GetWeather(string location)
        {
            using (var wc = new WebClient())
            {
                return wc.DownloadString(string.Format(_googleWeatherUrl, location));
            }
        }

        private void WriteJsonResponse(string callback, string json)
        {
            _context.Response.Clear();
            _context.Response.ContentType = "application/json";
            _context.Response.AddHeader("content-disposition", "attachment;filename=weather.json");

            _context.Response.Write(string.Format("{0}({1});", callback, json));

            _context.Response.Flush();
        }

        private string ToJson(string xml)
        {
            // Thank's NewtonSoft! You rock!
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(xml);
            return JsonConvert.SerializeXmlNode(doc);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}