﻿<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>falling stars</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="Model/point.js" type="text/javascript"></script>
    <script src="Model/vector.js" type="text/javascript"></script>
    <script src="Model/body.js" type="text/javascript"></script>
    <script src="Model/universe.js" type="text/javascript"></script>
    <script src="ViewModels/UniverseViewModel.js" type="text/javascript"></script>
    <script src="ViewModels/ViewPortInfo.js" type="text/javascript"></script>
    <script src="Controls/UniverseViewPort.js" type="text/javascript"></script>
</head>
<body>
    
    <h1><a href="/blog/falling-stars">Stars</a></h1>
<canvas id="canvas" height="800" width="800" style="margin: 20px;"></canvas>


<input type="text" id="gravity_x" value="0" />
<input type="text" id="gravity_y" value="0" />
<input type="button" onclick="setGravity();" value="set gravity" />

<script type="text/javascript">
    var view = new UniverseViewPort(document.getElementById('canvas'));


    function setGravity() {
        var x = document.getElementById('gravity_x').value;
        var y = document.getElementById('gravity_y').value;

        view.vm.setGravity(new Vector(parseFloat(x), parseFloat(y)));

    };

</script>

</body>
</html>
