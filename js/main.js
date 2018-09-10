$(function() {
    // // Try to fetch PDF locations from cookies.
    // var nobilisPDF = document.cookie.match('(^|;) ?nobilisPDF=([^;]*)(;|$)');
    // if(nobilisPDF)
    //   state.nobilisPDF = nobilisPDF[2];

    // Transform some parts of the text in the page.
    const transformText = function() {
        var html = $(this).html()

        // Turn page numbers into links (that don't currently do anything).
        html = html.replace(/\s*\[p(\d+)\]([\.\?\!:;,])?/g, function(match, page, punct) {
            return (punct || '') + '<sup><a class="pagenum" href="#"> [p' + page + ']</a></sup>';
        });

        // Turn refs into links to the referenced page.
        Object.entries(state.refs).forEach(function(arg) {
            var key   = arg[0];
            var value = arg[1];

            const pattern = RegExp('\\b' + key + '\\b', 'g');
            html = html.replace(pattern, function(match) {
                return '<a href="' + value + '">' + match + '</a>'
            });
        });

        // Save changes to the HTML of the selected element.
        $(this).html(html);
    };
    $('p').each(transformText);
    $('li').each(transformText);

    $(".pagenum").click(function(event) {
        event.preventDefault();

        // var input = $(document.createElement('input'));
        // input.attr('type', 'file');
        // // add onchange handler if you wish to get the file :)
        // input.trigger('click'); // opening dialog
        // input.on('change', function(event) {
        //     state.nobilisPDF = this.value;
        //     document.cookie = 'nobilisPDF=' + state.nobilisPDF + ';path=/';
        // });
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
