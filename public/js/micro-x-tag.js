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

    function getComponent(name, el) {
        var regname = name.toUpperCase();
        var registryItem = registry[regname];
        if (typeof registryItem == 'undefined') {
            throw Error("no tag " + name + " registered");
        };
        var component = new mxtElement(regname, registryItem, el);
        var config = component.registryListing.config;
        if (config.lifecycle && config.lifecycle.created) {
            config.lifecycle.created.apply(component);
        };

        return component;
    }

    function mxtElement (name, registryListing, origElement) {
        this.registryListing = registryListing;
        var newElement = document.createElement(name);
        this.el = newElement;
        if (origElement) {
            var attrs = $(origElement).prop("attributes");
            $.each(attrs, function() {
                newElement.setAttribute(this.name, this.value);
            });
        }
        this.el.appendChild(this.registryListing.fragment.cloneNode(true));
        // Support the methods in the "methods" property of the config
        $.extend(this, registryListing.config.methods);
        this._microx = {
            accessorLookup: {}
        };
        var accessors = registryListing.config.accessors;
        if (accessors) {
            for (var name in accessors) {
                if (accessors[name].attribute) {
                    if (accessors[name].attribute.name) {
                        this._microx.accessorLookup[accessors[name].attribute.name] = accessors[name];
                    }
                }
            }
        }
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
                var c = microXTag.getComponent(el.nodeName, el);
                var p = el.parentNode;
                p.replaceChild(c.el, el);
                c.onInsert();
            });
        },
        setAttribute: function (name, value) {
            //return;
            var accessor = this._microx.accessorLookup[name] || (function(accessors) {
                return accessors && accessors[name];
            })(this.registryListing.config.accessors);
                
            if (accessor && accessor.set) {
                return accessor.set.call(this, value);
            } else {
                return this.el.setAttribute(name, value);
            }
        },
        getAttribute: function (name) {
            //return "foo";
            var accessors = this.registryListing.config.accessors;
            if (accessors && accessors[name] && accessors[name].get) {
                console.log("Hey, we're using get accessor!");
                return accessors[name].get.call(this);
            } else {
                return this.el.getAttribute(name);
            }
        }
    };

    $.each(['getElementsByTagName'], function (index, methodName) {
        mxtElement.prototype[methodName] = function () {
            return this.el[methodName].apply(this.el, arguments);
        };
    });

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
