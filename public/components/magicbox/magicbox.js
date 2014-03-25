microXTag.register("magicbox", "magicbox-tmpl", {
    lifecycle: {
        created: function () {
            this.xtag.theBox = microXTag.query(this, '.magicbox');
        },
        inserted: function () {
            this.clickResponse();
        }
    },
    methods: {
        clickResponse: function () {
            var self = this;
            $(this.xtag.theBox).on("click", function () {
                alert("Clicky!");
                var hello = microXTag.getComponent('hello');
                var df = document.createDocumentFragment();
                df.appendChild(hello.el);
                microXTag.appendChild(self.el, df);
            });
        }
    }
})
//@ sourceURL=magicbox.js
