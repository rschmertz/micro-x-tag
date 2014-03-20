microXTag = (function ($) {
    function loadImports(importList) {
        $.each(importList, function (index, importFile) {
            $.get(importFile)
                .done(function (html) {
                    var elements = $(html);
                    $('body').append(elements);
                })
        });
    };

    return {
        loadImports: loadImports
    }
})(jQuery);
