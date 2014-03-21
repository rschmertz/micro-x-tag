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
        }
    });
    console.log("Executing dynamic JavaScript");
})();
//@ sourceURL=hello.js
