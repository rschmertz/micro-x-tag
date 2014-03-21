microXTag.register("magicbox", "magicbox-tmpl", {
    lifecycle: {
        created: function () {
            this.xtag.theBox = microXTag.query(this, '.magicbox');
        },
        inserted: function () {
            $(this.xtag.theBox).on("click", function () {
                alert("Clicky!");
            });
        }
    }
})
