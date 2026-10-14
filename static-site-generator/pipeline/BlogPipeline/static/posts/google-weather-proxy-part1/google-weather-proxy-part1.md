Well….  I tried to knock up a quick javascript widget to consume that [Google Weather API](http://www.google.com/ig/api?weather=melbourne) but quickly realized that:

 - XML in jQuery is no fun   
 - XML Cross domain requests are no fun

So instead, I’ll bang up a .NET ashx handler to act as a proxy, make the request and serialize it to JSON.  A little budget, but what the hell.  If I wanted it to be useful, I’d allow JSONP and probably use WCF RESTfulness, with a method for the weather and a method for the geo location.  But I’m cranking this out as we go, so let’s leave for that another day.
And for laughs, let's chuck in some [geo location](http://dev.w3.org/geo/api/spec-source.html#position).  Hopefully I’ll be able to do an [address lookup](https://code.google.com/apis/maps/documentation/geocoding/#ReverseGeocoding) with Google and get the right weather.

[Check out the demo here](/../projects/google-weather/)

But first, let’s get a handler together and make the request.
```
    public class WeatherProxy : IHttpHandler
    {
        private string _googleWeatherUrl = "http://www.google.com/ig/api?weather={0}";
        public void ProcessRequest(HttpContext context)
        {
            using (var wc = new WebClient())
            {
                // TODO: be location aware
                var result = wc.DownloadString(string.Format(_googleWeatherUrl, "melbourne"));
                
                context.Response.ContentType = "text/xml";
                context.Response.Write(result);
                
                context.Response.Flush();
                context.Response.Close();
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }

```
Veeery budget.  And not very useful.  All we have done is request some XML, and then written that back to the client.

OK - JSON. Nuget [NewtonSoft](http://json.codeplex.com/). NewtonSoft provides a [converter](http://stackoverflow.com/questions/814001/json-net-convert-json-string-to-xml-or-xml-to-json-string).  Nice.

Change the mime type and a little refactoring and we should be good.
```
        private void WriteJsonResponse(HttpContext context, string result)
        {
            context.Response.Clear();
            context.Response.ContentType = "application/json";
            context.Response.AddHeader("content-disposition", "attachment;filename=weather.json");

            context.Response.Write(result);

            context.Response.Flush();
            context.Response.Close();
        }

        private string ToJson(string xml)
        {
            // Thank's NewtonSoft! You rock!
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(xml);
            return JsonConvert.SerializeXmlNode(doc);
        }

```
Now we are in a position where we can consume that JSON in javascript.  Albeit only from the same domain. And only in Melbourne (hey, guess where I live!).
Firebug has let me easily inspect the returned JSON and hoover out the path.  It’s [nasty](http://www.youtube.com/watch?v=4r7wHMg5Yjg), but it mostly works.  
```
    <h2>How's the weather?</h2>

    <div id="weather">
    </div>

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
    <script type="text/javascript">

        $().ready(function () {
            $.getJSON('WeatherProxy.ashx', function (data) {
                $('<p>' + data.xml_api_reply.weather.current_conditions.condition["@data"] + '</p>').appendTo('#weather');

                $('<p>The temperature is ' + data.xml_api_reply.weather.current_conditions.temp_c["@data"] + '&deg;C</p>').appendTo('#weather');

                $('<span>Look&rsquo;s a bit like this: <image src="http://www.google.com/' + data.xml_api_reply.weather.current_conditions.icon["@data"] + '"></image></span>').appendTo('#weather');
            });
        });

    </script>

```

That is enough for one day. I think I need to score a google api key next for the geo location stuff.