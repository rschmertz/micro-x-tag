(function () {
    microXTag.register("hello", "hello-tmpl", {
        lifecycle: {
            created: function () {
                console.log("Created!");
            },
            inserted: function () {
                console.log("Inserted!");
            }
        }
    });
    console.log("Executing dynamic JavaScript");
})();
//@ sourceURL=hello.js
