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
            var componentPath = importFile.replace(/[^\/]*$/, '');
            function adjustPath(el, attr) {
                var src = el.getAttribute(attr);
                if (!/^\//.test(src)) {
                    el.setAttribute(attr, componentPath + src);
                }            
            };
            $.get(importFile)
                .done(function (html) {
                    var $elements = $(html);
                    var $scripts = $elements.filter('script[src]');
                    $scripts.each(function (index, script) {
                        adjustPath(script, 'src');
                    });
                    var $links = $elements.filter('link[rel="stylesheet"]');
                    var $nonlinks = $elements.not('link[rel="stylesheet"]');
                    $links.each(function (index, link) {
                        adjustPath(link, 'href');
                    });
                    $('body').append($nonlinks);
                    $('head').append($links);
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
            var errorMsg = "component already registered with name " + componentName;
            console.log(errorMsg);
            return;
        }
        registry[name] = {
            config: config,
            elementList: [],
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
        registryItem.elementList.push(component);
        var config = component.registryListing.config;
        if (config.lifecycle && config.lifecycle.created) {
            config.lifecycle.created.apply(component);
        };

        return component;
    }

    function standUpTag(el) {
        var tagName = el.nodeName,
            mxt = getComponent(tagName, el);
            parentEl = el.parentNode;
        parentEl.replaceChild(mxt.el, el);
        triggerChildrenInserted(mxt.el);
        return mxt;
    }        

    // micro-x-taggify the DOM elements passed in
    function standUpTags(tagList) {
        for (var i = 0, len = tagList.length; i < len; i++) {
            el = tagList[i];
            standUpTag(el);
        }
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
        this.el.setAttribute('x-micro-tags', true);
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
        var childXTags = microXTag.query(this, '[x-micro-tags=true]');
        $.each(childXTags || [], function (index, el) {
            var c = microXTag.getComponent(el.nodeName, el);
            var p = el.parentNode;
            p.replaceChild(c.el, el);
        });
        this.xtag = {}; //ease backward compatibility
    };

    mxtElement.prototype = {
        appendTo: function (newParent) {
            newParent.appendChild(this.el);
            this.onInsert();
        },
        getElement: function () {
            return this.el;
        },
        onInsert: function () {
            var config = this.registryListing.config;
            if (config.lifecycle && config.lifecycle.inserted) {
                config.lifecycle.inserted.apply(this);
            };
            this._microx.inserted = true;
        },
        setAttribute: function (name, value) {
            //return;
            var accessor = this._microx.accessorLookup[name] || (function(accessors) {
                return accessors && accessors[name];
            })(this.registryListing.config.accessors);
                
            if (accessor && accessor.set) {
                accessor.set.call(this, value);
            }
            return this.el.setAttribute(name, value);
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
        },
        addClass: function (classname) {
            $(this.el).addClass(classname);
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

    // Append newEl to parent, the micro-xtag way
    function appendChild(parent, newItem) {
        var newNodeList = [],
            i, len, newEl;

        if (newItem._microx) {
            newEl = newItem.el;
        } else {
            newEl = newItem;
        }
        if (newEl.nodeName == "#document-fragment") {
            for (i = 0, len = newEl.childNodes.length; i < len; i++) {
                newNodeList.push(newEl.childNodes[i]);
            };
        } else {
            newNodeList = [newEl];
        }
        parent.appendChild(newEl);
        if (newItem._microx && newItem._microx.inserted == true) return;
        for (var i = 0, len = newNodeList.length; i < len; i++) {
            triggerChildrenInserted(newNodeList[i]);
        };
    }

    // given a tag name and a DOM element, look up the mxtElement
    // object that is the wrapper for the DOM element
    function getMxtFromElement(el) {
        var registryItem = registry[el.nodeName];
        if (!registryItem) {
            console.log("Expected a registered tag named " + el.nodeName);
            return null;
        };
        var list = registryItem.elementList;
        var item = null;
        for (var i = 0, len = list.length; i < len; i++) {
            if (list[i].el == el) {
                item =  list[i];
            }
        };
        if (item == null) {
            console.log("Warning: mxtElement for " + el.nodeName + " not found");
        };
        return item;
    }

    function getMxtById(doc, id) {
        if (arguments.length < 2) {
            id = doc;
            doc = document;
        }
        var el = doc.getElementById(id);
        return getMxtFromElement(el);
    };

    function triggerChildrenInserted(el) {
        if (el.getAttribute('x-micro-tags') == 'true') {
            var mxt = getMxtFromElement(el);
            if (mxt) {
                mxt.onInsert();
            } else {
                console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA!!!!!!!!!!!!!!!!");
            }
            for (i = 0, len = el.children.length; i < len; i++) {
                triggerChildrenInserted(el.children[i]);
            };
        }
    }

    return {
        loadImports: loadImports,
        register: register,
        query: document.querySelector ? queryNative : queryAssisted,
        appendChild: appendChild,
        triggerChildrenInserted: triggerChildrenInserted,
        getMxtFromElement: getMxtFromElement,
        getMxtById: getMxtById,
        standUpTag: standUpTag,
        standUpTags: standUpTags,
        getComponent: getComponent
    }
})(jQuery);
