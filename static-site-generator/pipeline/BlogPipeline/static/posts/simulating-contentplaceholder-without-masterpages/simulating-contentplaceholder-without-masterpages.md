Oh back in the deeply wrong world of WebForms...

So somewhere in the misty depths of an ASPX page I wish to render out all the scraps of javascript that any ASCX user controls may require. You could use the ScriptManager and RegisterClientScriptBlock (and LoadScriptsBeforeUI=false), or be very tidy and bundle and minify all the little script snippets together.

Other times it is desirable to just keep all the HTML and script together in a single ASCX.

With a master page we can use ContentPlaceHolder, but in just a normal ASPX page?

Behold.  Add a placeholder to the ASPX, prehaps at the bottom of the page.

```
<asp:PlaceHolder runat="server" ID="ScriptsPlaceHolder"></asp:PlaceHolder>
```

In the user control we have a little javascript snippet, prehaps to hook up a click event. Who knows.

```
    html normally goes here

    <my:RenderPlaceHolder runat="server" PlaceHolderId="ScriptsPlaceHolder">
        <content>
           <script type="text/javascript">
              console.log('this script is rendered from a user control 
								into it's parents placeholder');
           </script>        
        </content>
    </my:RenderPlaceHolder>
```

The RenderPlaceHolder control will look up into the page and find the corresponding PlaceHolder control, dumping it's content into it.

```
    using System.Web.UI;

    [ParseChildren(true, "Content")]
    [PersistChildren(false)]
    public class RenderPlaceHolder : UserControl
    {
        protected override void Render(HtmlTextWriter writer)
        {
            // you should probably do some null reference checks here...
            Page.FindControl(PlaceHolderId).Controls.Add(Content);
            base.Render(writer);
        }

        public Control Content { get; set; }

        public string PlaceHolderId { get; set; }
    }

```
