microXTag = (function ($) {
    function loadImports(importList) {
        $.each(importList, function (index, importFile) {
            $.get(importFile)
                .done(function (html) {
                    var $elements = $(html);
                    $('body').append($elements);
                })
        });
    };

    function getFragmentFromTemplate(templateID) {
        var text = $("#" + templateID).text();
        var div = document.createElement('div');
        div.innerHTML = text;
        var df = document.createDocumentFragment();
        while (div.firstChild) {
            df.appendChild(div.firstChild);
        }
        return df;
    };

    return {
        loadImports: loadImports,
        getTemplate: getTemplate
    }
})(jQuery);
