(function () {
    microXTag.register("hello", "hello-tmpl", {
        lifecycle: {
            created: function () {
                console.log("Created!");
                var msg = this.getAttribute("x-message");
                if (!msg) {
                    this.setAttribute("x-message", "default message");
                }
                console.log(this.getAttribute("x-message"));
            },
            inserted: function () {
                console.log("Inserted!");
            }
        },
        accessors: {
            "x-message": {
                get: function () {
                    console.log("in hello's custom getAttribute");
                    return this.xtag.xmessage;
                },
                set: function (value) {
                    console.log("in hello's custom setAttribute");
                    this.xtag.xmessage = value;
                }
            }
        }
    });
    console.log("Executing dynamic JavaScript");

    microXTag.standUpTags(document.getElementsByTagName("hello"));
})();
//@ sourceURL=hello.js
