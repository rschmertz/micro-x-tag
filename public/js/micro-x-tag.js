if (typeof console == 'undefined') {
    window.console = {
        log: function (msg) {
            alert(msg);
        },
        dir: function () {}
    }
}

microXTag = (function ($) {
    function loadImports(importList, loaded) {
        var loadqueue = [];
        $.each(importList, function (index, importFile) {
            $.get(importFile)
                .done(function (html) {
                    var $elements = $(html);
                    $('body').append($elements);
                    loadqueue[index] = true;
                    if (loadqueue.length == importList.length) {
                        for (var i = 0; i < loadqueue.length &&
                             loadqueue[i] == true; i++);
                        if (i >= loadqueue.length) {
                            loaded();
                        }
                    };
                })
            loadqueue[index] = false; // request has been made but response not received
        });
    };

    var registry = {};

    function register(componentName, templateID, config) {
        if (registry[componentName]) {
            throw "component already registered with name " + componentName;
        }
        registry[componentName] = {
            config: config,
            fragment: getFragmentFromTemplate(templateID)
        }
    }

    function getComponent(name) {
        var registryItem = registry[name];
        var component = new mxtElement(registryItem);
        var config = component.registryListing.config;
        if (config.lifecycle && config.lifecycle.created) {
            config.lifecycle.created.apply(this);
        };

        return component;
    }

    function mxtElement (registryListing) {
        this.registryListing = registryListing;
        this.el = this.registryListing.fragment.cloneNode(true);
    };

    mxtElement.prototype = {
        appendTo: function (newParent) {
            newParent.appendChild(this.el);
            var config = this.registryListing.config;
            if (config.lifecycle && config.lifecycle.inserted) {
                config.lifecycle.inserted.apply(this);
            };
        }
    };

    function getFragmentFromTemplate(templateID) {
        var text = $("#" + templateID).html();
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
        register: register,
        getComponent: getComponent
    }
})(jQuery);
