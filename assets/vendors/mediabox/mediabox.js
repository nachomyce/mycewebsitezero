(function (root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.MediaBox = factory();
    }
}(this, function () {
    "use strict";

    var MediaBox = function (element) {
        if (!this || !(this instanceof MediaBox)) {
            return new MediaBox(element);
        }

        if (!element) {
            return false;
        }

        this.selector = element instanceof NodeList ? element : document.querySelectorAll(element);
        this.root     = document.querySelector('body');
        this.run();
    };

    MediaBox.prototype = {
        run: function () {
            Array.prototype.forEach.call(this.selector, function (el) {
                el.addEventListener('click', function (e) {
                    e.preventDefault();

                    var link = this.parseUrl(el.getAttribute('href'));
                    this.render(link);
                    this.events();
                }.bind(this), false);
            }.bind(this));

            this.root.addEventListener('keyup', function (e) {
                if ((e.keyCode || e.which) === 27) {
                    this.close(this.root.querySelector('.mediabox-wrap'));
                }
            }.bind(this), false);
        },
        template: function (s, d) {
            var p;

            for (p in d) {
                if (d.hasOwnProperty(p)) {
                    s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
                }
            }
            return s;
        },
        parseUrl: function (url) {
            var service = {},
                matches;

            if (matches = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)) {
                service.provider = "youtube";
                service.id       = matches[2];
            } else if (matches = url.match(/https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/)) {
                service.provider = "vimeo";
                service.id       = matches[3];
            } else {
                service.provider = "Unknown";
                service.id       = '';
            }

            return service;
        },
        render: function (service) {
            var embedLink,
                lightbox;

            if (service.provider === 'youtube') {
                embedLink = 'https://www.youtube.com/embed/' + service.id;
            } else if (service.provider === 'vimeo') {
                embedLink = 'https://player.vimeo.com/video/' + service.id;
            } else {
                throw new Error("Invalid video URL");
            }

            lightbox = this.template(
                '<div class="mediabox-wrap" role="dialog" aria-hidden="false"><div class="mediabox-content" role="document" tabindex="0"><span id="mediabox-esc" class="mediabox-close" aria-label="close" tabindex="1"></span><iframe src="{embed}?autoplay=1" frameborder="0" allowfullscreen></iframe></div></div>', {
                    embed: embedLink
                });

            this.lastFocusElement = document.activeElement;
            this.root.insertAdjacentHTML('beforeend', lightbox);
            document.body.classList.add('stop-scroll');
        },
        events: function () {
            var wrapper = document.querySelector('.mediabox-wrap');
            var content = document.querySelector('.mediabox-content');

            wrapper.addEventListener('click', function (e) {
                if (e.target && e.target.nodeName === 'SPAN' && e.target.className === 'mediabox-close' || e.target.nodeName === 'DIV' && e.target.className === 'mediabox-wrap' || (e.target.className === 'mediabox-content' && e.target.nodeName !== 'IFRAME')) {
                    this.close(wrapper);
                }
            }.bind(this), false);

            document.addEventListener('focus', function(e) {
                if (content && !content.contains(e.target)) {
                    e.stopPropagation();
                    content.focus();
                }
            }, true);

            content.addEventListener('keypress', function(e) {
                if (e.keyCode === 13) {
                    this.close(wrapper);
                }
            }.bind(this), false);
        },
        close: function (el) {
            if (el === null) return true;
            var timer = null;

            if (timer) {
                clearTimeout(timer);
            }

            el.classList.add('mediabox-hide');

            timer = setTimeout(function() {
                var el = document.querySelector('.mediabox-wrap');
                if (el !== null) {
                    document.body.classList.remove('stop-scroll');
                    this.root.removeChild(el);
                    this.lastFocusElement.focus();
                }
            }.bind(this), 500);
        }
    };

    return MediaBox;
}));
