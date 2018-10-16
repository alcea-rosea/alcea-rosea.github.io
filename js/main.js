$(function() {
    // Transform some parts of the text in the page.
    const transformText = function() {
        var html = $(this).html()

        // Turn page numbers into links (that don't currently do anything).
        html = html.replace(/\s*\[p(\d+)\]/g, function(match, num) {
            return '<sup><a href="#" class="pagenum ' + num + '">' + match + '</a></sup>';
        });

        // Turn refs into links to the referenced page.
        Object.entries(state.refs).forEach(function(arg) {
            var key   = arg[0];
            var value = arg[1];

            const pattern = RegExp('(?<!">)\\b' + key + '\\b(?!("|<\/a>))', 'g');
            html = html.replace(pattern, function(match) {
                return '<a href="' + value + '">' + match + '</a>'
            });
        });

        // Save changes to the HTML of the selected element.
        $(this).html(html);
    };
    $('p').each(transformText);
    $('li').each(transformText);
    $('td').each(transformText);

    // Create a function to change the page on the nobilisPDF window.
    const nobilisPDFSetPage = function(pageNum) {
        // Nobilis page numbers are off by 1 page from actual in the PDF.
        pageNum = (parseInt(pageNum) + 1).toString();

        if (state.nobilisPDF && !state.nobilisPDF.closed)
        {
            state.nobilisPDF.postMessage(pageNum, window.location.origin);
            state.nobilisPDF.focus();
        }
        else
        {
            window.open("/nobilis/pdf", "nobilisPDF", "x");
            state.pendingToNobilisPDF = pageNum;
        }
    };

    // When receiving an event from another window,
    // if the message is "nobilisPDF", use it to capture the window handle
    // of our child window so we can send it page number messages.
    window.addEventListener("message", function(event) {
        // Ignore messages from other origins.
        if (event.origin !== window.location.origin)
            return;

        if (event.data == "nobilisPDF" && !state.nobilisPDF)
        {
            state.nobilisPDF = event.source;

            if (state.pendingToNobilisPDF)
                nobilisPDFSetPage(state.pendingToNobilisPDF);
        }
    }, false);

    // When a page number link is clicked, get the page number from
    // the class list and update the page in the child window.
    $(".pagenum").click(function(event) {
        event.preventDefault();

        const pageNum = event.target.classList[1];
        nobilisPDFSetPage(pageNum);
    });

    // $('.collapse').collapse('hide');
    $('.list-group-item.active').parent().parent('.collapse').collapse('show');


    var pages = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
        // datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,

        prefetch: state.searchUrl
    });

    $('#search-box').typeahead({
        minLength: 0,
        highlight: true
    }, {
        name: 'pages',
        display: 'title',
        source: pages
    });

    $('#search-box').bind('typeahead:select', function(ev, suggestion) {
        window.location.href = suggestion.url;
    });


    // Markdown plain out to bootstrap style
    $('#markdown-content-container table').addClass('table');
    $('#markdown-content-container img').addClass('img-responsive');
});

///
// Add Markdown Heading Anchors
// (source: http://blog.parkermoore.de/2014/08/01/header-anchor-links-in-vanilla-javascript-for-github-pages-and-jekyll/)

var anchorForId = function (id) {
  var anchor = document.createElement("a");
  anchor.className = "header-link";
  anchor.href      = "#" + id;
  anchor.innerHTML = "<i class=\"fa fa-gear\"></i>";
  return anchor;
};

var linkifyAnchors = function (level, containingElement) {
  var headers = containingElement.getElementsByTagName("h" + level);
  for (var h = 0; h < headers.length; h++) {
    var header = headers[h];

    if (typeof header.id !== "undefined" && header.id !== "") {
      header.appendChild(anchorForId(header.id));
    }
  }
};

document.onreadystatechange = function () {
  if (this.readyState === "complete") {
    var contentBlock = document.getElementById("markdown-content-container");
    if (contentBlock) {
      for (var level = 1; level <= 6; level++) {
        linkifyAnchors(level, contentBlock);
      }
    }
  }
};
