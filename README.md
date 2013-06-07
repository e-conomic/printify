# Printify

Easy HTML print formatting. [Preview here](http://e-conomic.github.io/printify)

## Usage

First include [printify.js](https://github.com/e-conomic/printify/blob/master/printify.js) in your HTML page.
This exposes a global function called `printify`.
Simply call this on your content div you want formatted for printing

``` js
printify('#my-content');
```

You can add `<div class="page-break"></div>` in your content to indicate that this is an acceptible place to break the page.
Printify will automagically find these breaks and use them if a page break them would be nessary when printing a page.
If it decides to use a page-break it will add `page-actual-break` as a css class to it.

You can also add `left`, `top`, `right` or `bottom` static html content to every page by specifying these in the option map to printify

``` js
printify('#my-content', {
	top: function(pageNumber) {
		return '<div>i am on the top off page #'+pageNumber+'</div>';
	}
})
```

*Happy printing!*
