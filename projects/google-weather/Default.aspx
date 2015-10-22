<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Projects - Google Weather</title>
    <link rel="stylesheet" type="text/css" href="/content/site.css" />
</head>
<body>

    <h2>How's the weather?</h2>

    <div id="weather">

    </div>

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
    <script type="text/javascript">

        $().ready(function () {
            $.getJSON('http://benmcevoy.com.au/projects/google-weather/weatherproxy.ashx?&callback=?', function (data) {
                $('<p>' + data.xml_api_reply.weather.current_conditions.condition["@data"] + '</p>').appendTo('#weather');

                $('<p>The temperature is ' + data.xml_api_reply.weather.current_conditions.temp_c["@data"] + '&deg;C</p>').appendTo('#weather');

                $('<span>Look&rsquo;s a bit like this: <image src="http://www.google.com/' + data.xml_api_reply.weather.current_conditions.icon["@data"] + '"></image></span>').appendTo('#weather');
            });
        });

    </script>
</body>
</html>
