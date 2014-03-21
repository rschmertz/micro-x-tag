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
        var name = componentName.toUpperCase();
        if (registry[name]) {
            throw "component already registered with name " + componentName;
        }
        registry[name] = {
            config: config,
            fragment: getFragmentFromTemplate(templateID)
        }
    }

    function getComponent(name) {
        var regname = name.toUpperCase();
        var registryItem = registry[regname];
        if (typeof registryItem == 'undefined') {
            throw Error("no tag " + name + " registered");
        };
        var component = new mxtElement(regname, registryItem);
        var config = component.registryListing.config;
        if (config.lifecycle && config.lifecycle.created) {
            config.lifecycle.created.apply(component);
        };

        return component;
    }

    function mxtElement (name, registryListing) {
        this.registryListing = registryListing;
        this.el = document.createElement(name);
        this.el.appendChild(this.registryListing.fragment.cloneNode(true));
        // Support the methods in the "methods" property of the config
        $.extend(this, registryListing.config.methods);
        this.xtag = {}; //ease backward compatibility
    };

    mxtElement.prototype = {
        appendTo: function (newParent) {
            newParent.appendChild(this.el);
            this.onInsert();
        },
        onInsert: function () {
            var config = this.registryListing.config;
            if (config.lifecycle && config.lifecycle.inserted) {
                config.lifecycle.inserted.apply(this);
            };
            var childXTags = microXTag.query(this, '[x-micro-tags=true]');
            $.each(childXTags || [], function (index, el) {
                //console.dir(el);
                var c = microXTag.getComponent(el.nodeName);
                var p = el.parentNode;
                p.replaceChild(c.el, el);
                c.onInsert();
            });
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

    function queryNative(mxtag, selector) {
        return mxtag.el.querySelectorAll(selector);
    }

    function queryAssisted(mxtag, selector) {
        var $result = $(mxtag.el).find(selector);
        return $result.get();
    }

    return {
        loadImports: loadImports,
        register: register,
        query: document.querySelector ? queryNative : queryAssisted,
        getComponent: getComponent
    }
})(jQuery);
