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
                var hello2 = microXTag.getComponent('hello');
                hello2.setAttribute('x-message', "appended as mxtElement");
                hello2.setAttribute('x-misc-attr', 'something');
                hello2.addClass('special-addition');
                microXTag.appendChild(self.el, hello2);
            });
        }
    }
})
//@ sourceURL=magicbox.js
