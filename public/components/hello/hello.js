(function () {
    microXTag.register("hello", "hello-tmpl", {
        lifecycle: {
            inserted: function () {
                console.log("Inserted!");
            }
        }
    });
    console.log("Executing dynamic JavaScript");
})();
//@ sourceURL=hello.js
