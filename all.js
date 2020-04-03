function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }

    return obj;
}

function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);

        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }

        ownKeys.forEach(function (key) {
            _defineProperty(target, key, source[key]);
        });
    }

    return target;
}

function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}


function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}



function getAttrConfig(attr) {
    var element = DOCUMENT.querySelector('script[' + attr + ']');

    if (element) {
        return element.getAttribute(attr);
    }
}

function coerce(val) {
    // Getting an empty string will occur if the attribute is set on the HTML tag but without a value
    // We'll assume that this is an indication that it should be toggled to true
    // For example <script data-search-pseudo-elements src="..."></script>
    if (val === '') return true;
    if (val === 'false') return false;
    if (val === 'true') return true;
    return val;
}


function domready(fn) {
    if (!IS_DOM) return;
    loaded ? setTimeout(fn, 0) : functions.push(fn);
}


function isReserved(name) {
    return ~RESERVED_CLASSES.indexOf(name);
}


function insertCss(css) {
    if (!css || !IS_DOM) {
        return;
    }

    var style = DOCUMENT.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = css;
    var headChildren = DOCUMENT.head.childNodes;
    var beforeChild = null;

    for (var i = headChildren.length - 1; i > -1; i--) {
        var child = headChildren[i];
        var tagName = (child.tagName || '').toUpperCase();

        if (['STYLE', 'LINK'].indexOf(tagName) > -1) {
            beforeChild = child;
        }
    }

    DOCUMENT.head.insertBefore(style, beforeChild);
    return css;
}

function toArray(obj) {
    var array = [];

    for (var i = (obj || []).length >>> 0; i--;) {
        array[i] = obj[i];
    }

    return array;
}

function classArray(node) {
    if (node.classList) {
        return toArray(node.classList);
    } else {
        return (node.getAttribute('class') || '').split(' ').filter(function (i) {
            return i;
        });
    }
}

function getIconName(familyPrefix, cls) {
    var parts = cls.split('-');
    var prefix = parts[0];
    var iconName = parts.slice(1).join('-');

    if (prefix === familyPrefix && iconName !== '' && !isReserved(iconName)) {
        return iconName;
    } else {
        return null;
    }
}

function htmlEscape(str) {
    return "".concat(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function joinAttributes(attributes) {
    return Object.keys(attributes || {}).reduce(function (acc, attributeName) {
        return acc + "".concat(attributeName, "=\"").concat(htmlEscape(attributes[attributeName]), "\" ");
    }, '').trim();
}

function joinStyles(styles) {
    return Object.keys(styles || {}).reduce(function (acc, styleName) {
        return acc + "".concat(styleName, ": ").concat(styles[styleName], ";");
    }, '');
}

function transformIsMeaningful(transform) {
    return transform.size !== meaninglessTransform.size || transform.x !== meaninglessTransform.x || transform.y !== meaninglessTransform.y || transform.rotate !== meaninglessTransform.rotate || transform.flipX || transform.flipY;
}


function makeIconStandard(_ref) {
    var children = _ref.children,
        attributes = _ref.attributes,
        main = _ref.main,
        transform = _ref.transform,
        styles = _ref.styles;
    var styleString = joinStyles(styles);

    if (styleString.length > 0) {
        attributes['style'] = styleString;
    }

    if (transformIsMeaningful(transform)) {
        var trans = transformForSvg({
            transform: transform,
            containerWidth: main.width,
            iconWidth: main.width
        });
        children.push({
            tag: 'g',
            attributes: _objectSpread({}, trans.outer),
            children: [{
                tag: 'g',
                attributes: _objectSpread({}, trans.inner),
                children: [{
                    tag: main.icon.tag,
                    children: main.icon.children,
                    attributes: _objectSpread({}, main.icon.attributes, trans.path)
                }]
            }]
        });
    } else {
        children.push(main.icon);
    }

    return {
        children: children,
        attributes: attributes
    };
}

function asIcon(_ref) {
    var children = _ref.children,
        main = _ref.main,
        mask = _ref.mask,
        attributes = _ref.attributes,
        styles = _ref.styles,
        transform = _ref.transform;

    if (transformIsMeaningful(transform) && main.found && !mask.found) {
        var width = main.width,
            height = main.height;
        var offset = {
            x: width / height / 2,
            y: 0.5
        };
        attributes['style'] = joinStyles(_objectSpread({}, styles, {
            'transform-origin': "".concat(offset.x + transform.x / 16, "em ").concat(offset.y + transform.y / 16, "em")
        }));
    }

    return [{
        tag: 'svg',
        attributes: attributes,
        children: children
    }];
}



function makeInlineSvgAbstract(params) {
    var _params$icons = params.icons,
        main = _params$icons.main,
        mask = _params$icons.mask,
        prefix = params.prefix,
        iconName = params.iconName,
        transform = params.transform,
        symbol = params.symbol,
        title = params.title,
        extra = params.extra,
        _params$watchable = params.watchable,
        watchable = _params$watchable === void 0 ? false : _params$watchable;

    var _ref = mask.found ? mask : main,
        width = _ref.width,
        height = _ref.height;

    var widthClass = "fa-w-".concat(Math.ceil(width / height * 16));
    var attrClass = [config.replacementClass, iconName ? "".concat(config.familyPrefix, "-").concat(iconName) : '', widthClass].filter(function (c) {
        return extra.classes.indexOf(c) === -1;
    }).concat(extra.classes).join(' ');
    var content = {
        children: [],
        attributes: _objectSpread({}, extra.attributes, {
            'data-prefix': prefix,
            'data-icon': iconName,
            'class': attrClass,
            'role': 'img',
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': "0 0 ".concat(width, " ").concat(height)
        })
    };

    if (watchable) {
        content.attributes[DATA_FA_I2SVG] = '';
    }

    if (title) content.children.push({
        tag: 'title',
        attributes: {
            id: content.attributes['aria-labelledby'] || "title-".concat(nextUniqueId())
        },
        children: [title]
    });

    var args = _objectSpread({}, content, {
        prefix: prefix,
        iconName: iconName,
        main: main,
        mask: mask,
        transform: transform,
        symbol: symbol,
        styles: extra.styles
    });

    var _ref2 = mask.found && main.found ? makeIconMasking(args) : makeIconStandard(args),
        children = _ref2.children,
        attributes = _ref2.attributes;

    args.children = children;
    args.attributes = attributes;

    if (symbol) {
        return asSymbol(args);
    } else {
        return asIcon(args);
    }
}


var noop$1 = function noop() {};

var p = config.measurePerformance && PERFORMANCE && PERFORMANCE.mark && PERFORMANCE.measure ? PERFORMANCE : {
    mark: noop$1,
    measure: noop$1
};
var preamble = "FA \"5.6.3\"";

var begin = function begin(name) {
    p.mark("".concat(preamble, " ").concat(name, " begins"));
    return function () {
        return end(name);
    };
};

var end = function end(name) {
    p.mark("".concat(preamble, " ").concat(name, " ends"));
    p.measure("".concat(preamble, " ").concat(name), "".concat(preamble, " ").concat(name, " begins"), "".concat(preamble, " ").concat(name, " ends"));
};



var reduce = function fastReduceObject(subject, fn, initialValue, thisContext) {
    var keys = Object.keys(subject),
        length = keys.length,
        iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
        i,
        key,
        result;

    if (initialValue === undefined) {
        i = 1;
        result = subject[keys[0]];
    } else {
        i = 0;
        result = initialValue;
    }

    for (; i < length; i++) {
        key = keys[i];
        result = iterator(result, subject[key], key, subject);
    }

    return result;
};

var styles = namespace.styles,
    shims = namespace.shims;
var _byUnicode = {};
var _byLigature = {};
var _byOldName = {};
var build = function build() {
    var lookup = function lookup(reducer) {
        return reduce(styles, function (o, style, prefix) {
            o[prefix] = reduce(style, reducer, {});
            return o;
        }, {});
    };

    _byUnicode = lookup(function (acc, icon, iconName) {
        acc[icon[3]] = iconName;
        return acc;
    });
    _byLigature = lookup(function (acc, icon, iconName) {
        var ligatures = icon[2];
        acc[iconName] = iconName;
        ligatures.forEach(function (ligature) {
            acc[ligature] = iconName;
        });
        return acc;
    });
    var hasRegular = 'far' in styles;
    _byOldName = reduce(shims, function (acc, shim) {
        var oldName = shim[0];
        var prefix = shim[1];
        var iconName = shim[2];

        if (prefix === 'far' && !hasRegular) {
            prefix = 'fas';
        }

        acc[oldName] = {
            prefix: prefix,
            iconName: iconName
        };
        return acc;
    }, {});
};
build();

function byUnicode(prefix, unicode) {
    return _byUnicode[prefix][unicode];
}

function byLigature(prefix, ligature) {
    return _byLigature[prefix][ligature];
}

function byOldName(name) {
    return _byOldName[name] || {
        prefix: null,
        iconName: null
    };
}

var styles$1 = namespace.styles;
var emptyCanonicalIcon = function emptyCanonicalIcon() {
    return {
        prefix: null,
        iconName: null,
        rest: []
    };
};

function getCanonicalIcon(values) {
    return values.reduce(function (acc, cls) {
        var iconName = getIconName(config.familyPrefix, cls);

        if (styles$1[cls]) {
            acc.prefix = cls;
        } else if (iconName) {
            var shim = acc.prefix === 'fa' ? byOldName(iconName) : {};
            acc.iconName = shim.iconName || iconName;
            acc.prefix = shim.prefix || acc.prefix;
        } else if (cls !== config.replacementClass && cls.indexOf('fa-w-') !== 0) {
            acc.rest.push(cls);
        }

        return acc;
    }, emptyCanonicalIcon());
}

function iconFromMapping(mapping, prefix, iconName) {
    if (mapping && mapping[prefix] && mapping[prefix][iconName]) {
        return {
            prefix: prefix,
            iconName: iconName,
            icon: mapping[prefix][iconName]
        };
    }
}

function toHtml(abstractNodes) {
    var tag = abstractNodes.tag,
        _abstractNodes$attrib = abstractNodes.attributes,
        attributes = _abstractNodes$attrib === void 0 ? {} : _abstractNodes$attrib,
        _abstractNodes$childr = abstractNodes.children,
        children = _abstractNodes$childr === void 0 ? [] : _abstractNodes$childr;

    if (typeof abstractNodes === 'string') {
        return htmlEscape(abstractNodes);
    } else {
        return "<".concat(tag, " ").concat(joinAttributes(attributes), ">").concat(children.map(toHtml).join(''), "</").concat(tag, ">");
    }
}

var noop$2 = function noop() {};

function isWatched(node) {
    var i2svg = node.getAttribute ? node.getAttribute(DATA_FA_I2SVG) : null;
    return typeof i2svg === 'string';
}

function getMutator() {
    if (config.autoReplaceSvg === true) {
        return mutators.replace;
    }

    var mutator = mutators[config.autoReplaceSvg];
    return mutator || mutators.replace;
}

var mutators = {
    replace: function replace(mutation) {
        var node = mutation[0];
        var abstract = mutation[1];
        var newOuterHTML = abstract.map(function (a) {
            return toHtml(a);
        }).join('\n');

        if (node.parentNode && node.outerHTML) {
            node.outerHTML = newOuterHTML + (config.keepOriginalSource && node.tagName.toLowerCase() !== 'svg' ? "<!-- ".concat(node.outerHTML, " -->") : '');
        } else if (node.parentNode) {
            var newNode = document.createElement('span');
            node.parentNode.replaceChild(newNode, node);
            newNode.outerHTML = newOuterHTML;
        }
    },
    nest: function nest(mutation) {
        var node = mutation[0];
        var abstract = mutation[1]; // If we already have a replaced node we do not want to continue nesting within it.
        // Short-circuit to the standard replacement

        if (~classArray(node).indexOf(config.replacementClass)) {
            return mutators.replace(mutation);
        }

        var forSvg = new RegExp("".concat(config.familyPrefix, "-.*"));
        delete abstract[0].attributes.style;
        var splitClasses = abstract[0].attributes.class.split(' ').reduce(function (acc, cls) {
            if (cls === config.replacementClass || cls.match(forSvg)) {
                acc.toSvg.push(cls);
            } else {
                acc.toNode.push(cls);
            }

            return acc;
        }, {
            toNode: [],
            toSvg: []
        });
        abstract[0].attributes.class = splitClasses.toSvg.join(' ');
        var newInnerHTML = abstract.map(function (a) {
            return toHtml(a);
        }).join('\n');
        node.setAttribute('class', splitClasses.toNode.join(' '));
        node.setAttribute(DATA_FA_I2SVG, '');
        node.innerHTML = newInnerHTML;
    }
};

function perform(mutations, callback) {
    var callbackFunction = typeof callback === 'function' ? callback : noop$2;

    if (mutations.length === 0) {
        callbackFunction();
    } else {
        var frame = WINDOW.requestAnimationFrame || function (op) {
            return op();
        };

        frame(function () {
            var mutator = getMutator();
            var mark = perf.begin('mutate');
            mutations.map(mutator);
            mark();
            callbackFunction();
        });
    }
}
var disabled = false;

function disableObservation(operation) {
    disabled = true;
    operation();
    disabled = false;
}
var mo = null;

function observe(options) {
    if (!MUTATION_OBSERVER) {
        return;
    }

    if (!config.observeMutations) {
        return;
    }

    var treeCallback = options.treeCallback,
        nodeCallback = options.nodeCallback,
        pseudoElementsCallback = options.pseudoElementsCallback,
        _options$observeMutat = options.observeMutationsRoot,
        observeMutationsRoot = _options$observeMutat === void 0 ? DOCUMENT.body : _options$observeMutat;
    mo = new MUTATION_OBSERVER(function (objects) {
        if (disabled) return;
        toArray(objects).forEach(function (mutationRecord) {
            if (mutationRecord.type === 'childList' && mutationRecord.addedNodes.length > 0 && !isWatched(mutationRecord.addedNodes[0])) {
                if (config.searchPseudoElements) {
                    pseudoElementsCallback(mutationRecord.target);
                }

                treeCallback(mutationRecord.target);
            }

            if (mutationRecord.type === 'attributes' && mutationRecord.target.parentNode && config.searchPseudoElements) {
                pseudoElementsCallback(mutationRecord.target.parentNode);
            }

            if (mutationRecord.type === 'attributes' && isWatched(mutationRecord.target) && ~ATTRIBUTES_WATCHED_FOR_MUTATION.indexOf(mutationRecord.attributeName)) {
                if (mutationRecord.attributeName === 'class') {
                    var _getCanonicalIcon = getCanonicalIcon(classArray(mutationRecord.target)),
                        prefix = _getCanonicalIcon.prefix,
                        iconName = _getCanonicalIcon.iconName;

                    if (prefix) mutationRecord.target.setAttribute('data-prefix', prefix);
                    if (iconName) mutationRecord.target.setAttribute('data-icon', iconName);
                } else {
                    nodeCallback(mutationRecord.target);
                }
            }
        });
    });
    if (!IS_DOM) return;
    mo.observe(observeMutationsRoot, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
    });
}

function disconnect() {
    if (!mo) return;
    mo.disconnect();
}

function styleParser(node) {
    var style = node.getAttribute('style');
    var val = [];

    if (style) {
        val = style.split(';').reduce(function (acc, style) {
            var styles = style.split(':');
            var prop = styles[0];
            var value = styles.slice(1);

            if (prop && value.length > 0) {
                acc[prop] = value.join(':').trim();
            }

            return acc;
        }, {});
    }

    return val;
}

function toHex(unicode) {
    var result = '';

    for (var i = 0; i < unicode.length; i++) {
        var hex = unicode.charCodeAt(i).toString(16);
        result += ('000' + hex).slice(-4);
    }

    return result;
}

function classParser(node) {
    var existingPrefix = node.getAttribute('data-prefix');
    var existingIconName = node.getAttribute('data-icon');
    var innerText = node.innerText !== undefined ? node.innerText.trim() : '';
    var val = getCanonicalIcon(classArray(node));

    if (existingPrefix && existingIconName) {
        val.prefix = existingPrefix;
        val.iconName = existingIconName;
    }

    if (val.prefix && innerText.length > 1) {
        val.iconName = byLigature(val.prefix, node.innerText);
    } else if (val.prefix && innerText.length === 1) {
        val.iconName = byUnicode(val.prefix, toHex(node.innerText));
    }

    return val;
}

var parseTransformString = function parseTransformString(transformString) {
    var transform = {
        size: 16,
        x: 0,
        y: 0,
        flipX: false,
        flipY: false,
        rotate: 0
    };

    if (!transformString) {
        return transform;
    } else {
        return transformString.toLowerCase().split(' ').reduce(function (acc, n) {
            var parts = n.toLowerCase().split('-');
            var first = parts[0];
            var rest = parts.slice(1).join('-');

            if (first && rest === 'h') {
                acc.flipX = true;
                return acc;
            }

            if (first && rest === 'v') {
                acc.flipY = true;
                return acc;
            }

            rest = parseFloat(rest);

            if (isNaN(rest)) {
                return acc;
            }

            switch (first) {
                case 'grow':
                    acc.size = acc.size + rest;
                    break;

                case 'shrink':
                    acc.size = acc.size - rest;
                    break;

                case 'left':
                    acc.x = acc.x - rest;
                    break;

                case 'right':
                    acc.x = acc.x + rest;
                    break;

                case 'up':
                    acc.y = acc.y - rest;
                    break;

                case 'down':
                    acc.y = acc.y + rest;
                    break;

                case 'rotate':
                    acc.rotate = acc.rotate + rest;
                    break;
            }

            return acc;
        }, transform);
    }
};

function transformParser(node) {
    return parseTransformString(node.getAttribute('data-fa-transform'));
}

function symbolParser(node) {
    var symbol = node.getAttribute('data-fa-symbol');
    return symbol === null ? false : symbol === '' ? true : symbol;
}

function attributesParser(node) {
    var extraAttributes = toArray(node.attributes).reduce(function (acc, attr) {
        if (acc.name !== 'class' && acc.name !== 'style') {
            acc[attr.name] = attr.value;
        }

        return acc;
    }, {});
    var title = node.getAttribute('title');

    if (config.autoA11y) {
        if (title) {
            extraAttributes['aria-labelledby'] = "".concat(config.replacementClass, "-title-").concat(nextUniqueId());
        } else {
            extraAttributes['aria-hidden'] = 'true';
        }
    }

    return extraAttributes;
}

function maskParser(node) {
    var mask = node.getAttribute('data-fa-mask');

    if (!mask) {
        return emptyCanonicalIcon();
    } else {
        return getCanonicalIcon(mask.split(' ').map(function (i) {
            return i.trim();
        }));
    }
}

var blankMeta = {
    iconName: null,
    title: null,
    prefix: null,
    transform: meaninglessTransform,
    symbol: false,
    mask: null,
    extra: {
        classes: [],
        styles: {},
        attributes: {}
    }
};

function parseMeta(node) {
    var _classParser = classParser(node),
        iconName = _classParser.iconName,
        prefix = _classParser.prefix,
        extraClasses = _classParser.rest;

    var extraStyles = styleParser(node);
    var transform = transformParser(node);
    var symbol = symbolParser(node);
    var extraAttributes = attributesParser(node);
    var mask = maskParser(node);
    return {
        iconName: iconName,
        title: node.getAttribute('title'),
        prefix: prefix,
        transform: transform,
        symbol: symbol,
        mask: mask,
        extra: {
            classes: extraClasses,
            styles: extraStyles,
            attributes: extraAttributes
        }
    };
}


function findIcon(iconName, prefix) {
    var val = {
        found: false,
        width: 512,
        height: 512,
        icon: missing
    };

    if (iconName && prefix && styles$2[prefix] && styles$2[prefix][iconName]) {
        var icon = styles$2[prefix][iconName];
        var width = icon[0];
        var height = icon[1];
        var vectorData = icon.slice(4);
        val = {
            found: true,
            width: width,
            height: height,
            icon: {
                tag: 'path',
                attributes: {
                    fill: 'currentColor',
                    d: vectorData[0]
                }
            }
        };
    } else if (iconName && prefix && !config.showMissingIcons) {
        throw new MissingIcon("Icon is missing for prefix ".concat(prefix, " with icon name ").concat(iconName));
    }

    return val;
}

function generateSvgReplacementMutation(node, nodeMeta) {
    var iconName = nodeMeta.iconName,
        title = nodeMeta.title,
        prefix = nodeMeta.prefix,
        transform = nodeMeta.transform,
        symbol = nodeMeta.symbol,
        mask = nodeMeta.mask,
        extra = nodeMeta.extra;
    return [node, makeInlineSvgAbstract({
        icons: {
            main: findIcon(iconName, prefix),
            mask: findIcon(mask.iconName, mask.prefix)
        },
        prefix: prefix,
        iconName: iconName,
        transform: transform,
        symbol: symbol,
        mask: mask,
        title: title,
        extra: extra,
        watchable: true
    })];
}


function generateMutation(node) {
    var nodeMeta = parseMeta(node);

    if (~nodeMeta.extra.classes.indexOf(LAYERS_TEXT_CLASSNAME)) {
        return generateLayersText(node, nodeMeta);
    } else {
        return generateSvgReplacementMutation(node, nodeMeta);
    }
}


function onTree(root) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    if (!IS_DOM) return;
    var htmlClassList = DOCUMENT.documentElement.classList;

    var hclAdd = function hclAdd(suffix) {
        return htmlClassList.add("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
    };

    var hclRemove = function hclRemove(suffix) {
        return htmlClassList.remove("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
    };

    var prefixes = Object.keys(styles$2);
    var prefixesDomQuery = [".".concat(LAYERS_TEXT_CLASSNAME, ":not([").concat(DATA_FA_I2SVG, "])")].concat(prefixes.map(function (p) {
        return ".".concat(p, ":not([").concat(DATA_FA_I2SVG, "])");
    })).join(', ');

    if (prefixesDomQuery.length === 0) {
        return;
    }

    var candidates = toArray(root.querySelectorAll(prefixesDomQuery));

    if (candidates.length > 0) {
        hclAdd('pending');
        hclRemove('complete');
    } else {
        return;
    }

    var mark = perf.begin('onTree');
    var mutations = candidates.reduce(function (acc, node) {
        try {
            var mutation = generateMutation(node);

            if (mutation) {
                acc.push(mutation);
            }
        } catch (e) {
            if (!PRODUCTION) {
                if (e instanceof MissingIcon) {
                    console.error(e);
                }
            }
        }

        return acc;
    }, []);
    mark();
    perform(mutations, function () {
        hclAdd('active');
        hclAdd('complete');
        hclRemove('pending');
        if (typeof callback === 'function') callback();
    });
}

function onNode(node) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var mutation = generateMutation(node);

    if (mutation) {
        perform([mutation], callback);
    }
}

var baseStyles = "svg:not(:root).svg-inline--fa{overflow:visible}.svg-inline--fa{display:inline-block;font-size:inherit;height:1em;overflow:visible;vertical-align:-.125em}.svg-inline--fa.fa-lg{vertical-align:-.225em}.svg-inline--fa.fa-w-1{width:.0625em}.svg-inline--fa.fa-w-2{width:.125em}.svg-inline--fa.fa-w-3{width:.1875em}.svg-inline--fa.fa-w-4{width:.25em}.svg-inline--fa.fa-w-5{width:.3125em}.svg-inline--fa.fa-w-6{width:.375em}.svg-inline--fa.fa-w-7{width:.4375em}.svg-inline--fa.fa-w-8{width:.5em}.svg-inline--fa.fa-w-9{width:.5625em}.svg-inline--fa.fa-w-10{width:.625em}.svg-inline--fa.fa-w-11{width:.6875em}.svg-inline--fa.fa-w-12{width:.75em}.svg-inline--fa.fa-w-13{width:.8125em}.svg-inline--fa.fa-w-14{width:.875em}.svg-inline--fa.fa-w-15{width:.9375em}.svg-inline--fa.fa-w-16{width:1em}.svg-inline--fa.fa-w-17{width:1.0625em}.svg-inline--fa.fa-w-18{width:1.125em}.svg-inline--fa.fa-w-19{width:1.1875em}.svg-inline--fa.fa-w-20{width:1.25em}.svg-inline--fa.fa-pull-left{margin-right:.3em;width:auto}.svg-inline--fa.fa-pull-right{margin-left:.3em;width:auto}.svg-inline--fa.fa-border{height:1.5em}.svg-inline--fa.fa-li{width:2em}.svg-inline--fa.fa-fw{width:1.25em}.fa-layers svg.svg-inline--fa{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.fa-layers{display:inline-block;height:1em;position:relative;text-align:center;vertical-align:-.125em;width:1em}.fa-layers svg.svg-inline--fa{-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter,.fa-layers-text{display:inline-block;position:absolute;text-align:center}.fa-layers-text{left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter{background-color:#ff253a;border-radius:1em;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;height:1.5em;line-height:1;max-width:5em;min-width:1.5em;overflow:hidden;padding:.25em;right:0;text-overflow:ellipsis;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-bottom-right{bottom:0;right:0;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom right;transform-origin:bottom right}.fa-layers-bottom-left{bottom:0;left:0;right:auto;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom left;transform-origin:bottom left}.fa-layers-top-right{right:0;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-top-left{left:0;right:auto;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top left;transform-origin:top left}.fa-lg{font-size:1.3333333333em;line-height:.75em;vertical-align:-.0667em}.fa-xs{font-size:.75em}.fa-sm{font-size:.875em}.fa-1x{font-size:1em}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-6x{font-size:6em}.fa-7x{font-size:7em}.fa-8x{font-size:8em}.fa-9x{font-size:9em}.fa-10x{font-size:10em}.fa-fw{text-align:center;width:1.25em}.fa-ul{list-style-type:none;margin-left:2.5em;padding-left:0}.fa-ul>li{position:relative}.fa-li{left:-2em;position:absolute;text-align:center;width:2em;line-height:inherit}.fa-border{border:solid .08em #eee;border-radius:.1em;padding:.2em .25em .15em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left,.fab.fa-pull-left,.fal.fa-pull-left,.far.fa-pull-left,.fas.fa-pull-left{margin-right:.3em}.fa.fa-pull-right,.fab.fa-pull-right,.fal.fa-pull-right,.far.fa-pull-right,.fas.fa-pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.fa-rotate-90{-webkit-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{-webkit-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{-webkit-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{-webkit-transform:scale(-1,1);transform:scale(-1,1)}.fa-flip-vertical{-webkit-transform:scale(1,-1);transform:scale(1,-1)}.fa-flip-horizontal.fa-flip-vertical{-webkit-transform:scale(-1,-1);transform:scale(-1,-1)}:root .fa-flip-horizontal,:root .fa-flip-vertical,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-rotate-90{-webkit-filter:none;filter:none}.fa-stack{display:inline-block;height:2em;position:relative;width:2.5em}.fa-stack-1x,.fa-stack-2x{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.svg-inline--fa.fa-stack-1x{height:1em;width:1.25em}.svg-inline--fa.fa-stack-2x{height:2em;width:2.5em}.fa-inverse{color:#fff}.sr-only{border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.sr-only-focusable:active,.sr-only-focusable:focus{clip:auto;height:auto;margin:0;overflow:visible;position:static;width:auto}";

function css() {
    var dfp = DEFAULT_FAMILY_PREFIX;
    var drc = DEFAULT_REPLACEMENT_CLASS;
    var fp = config.familyPrefix;
    var rc = config.replacementClass;
    var s = baseStyles;

    if (fp !== dfp || rc !== drc) {
        var dPatt = new RegExp("\\.".concat(dfp, "\\-"), 'g');
        var rPatt = new RegExp("\\.".concat(drc), 'g');
        s = s.replace(dPatt, ".".concat(fp, "-")).replace(rPatt, ".".concat(rc));
    }

    return s;
}



var Library =
    /*#__PURE__*/
    function () {
        function Library() {
            _classCallCheck(this, Library);

            this.definitions = {};
        }

        _createClass(Library, [{
            key: "add",
            value: function add() {
                var _this = this;

                for (var _len = arguments.length, definitions = new Array(_len), _key = 0; _key < _len; _key++) {
                    definitions[_key] = arguments[_key];
                }

                var additions = definitions.reduce(this._pullDefinitions, {});
                Object.keys(additions).forEach(function (key) {
                    _this.definitions[key] = _objectSpread({}, _this.definitions[key] || {}, additions[key]);
                    define(key, additions[key]);
                    build();
                });
            }
        }, {
            key: "reset",
            value: function reset() {
                this.definitions = {};
            }
        }, {
            key: "_pullDefinitions",
            value: function _pullDefinitions(additions, definition) {
                var normalized = definition.prefix && definition.iconName && definition.icon ? {
                    0: definition
                } : definition;
                Object.keys(normalized).map(function (key) {
                    var _normalized$key = normalized[key],
                        prefix = _normalized$key.prefix,
                        iconName = _normalized$key.iconName,
                        icon = _normalized$key.icon;
                    if (!additions[prefix]) additions[prefix] = {};
                    additions[prefix][iconName] = icon;
                });
                return additions;
            }
        }]);

        return Library;
    }();



function ensureCss() {
    if (config.autoAddCss && !_cssInserted) {
        insertCss(css());

        _cssInserted = true;
    }
}



var library = new Library();
var noAuto = function noAuto() {
    config.autoReplaceSvg = false;
    config.observeMutations = false;
    disconnect();
};
var _cssInserted = false;
var dom = {
    i2svg: function i2svg() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (IS_DOM) {
            ensureCss();
            var _params$node = params.node,
                node = _params$node === void 0 ? DOCUMENT : _params$node,
                _params$callback = params.callback,
                callback = _params$callback === void 0 ? function () {} : _params$callback;

            if (config.searchPseudoElements) {
                searchPseudoElements(node);
            }

            onTree(node, callback);
        }
    },
    css: css,
    insertCss: function insertCss$$1() {
        if (!_cssInserted) {
            insertCss(css());

            _cssInserted = true;
        }
    },
    watch: function watch() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var autoReplaceSvgRoot = params.autoReplaceSvgRoot,
            observeMutationsRoot = params.observeMutationsRoot;

        if (config.autoReplaceSvg === false) {
            config.autoReplaceSvg = true;
        }

        config.observeMutations = true;
        domready(function () {
            autoReplace({
                autoReplaceSvgRoot: autoReplaceSvgRoot
            });
            observe({
                treeCallback: onTree,
                nodeCallback: onNode,
                pseudoElementsCallback: searchPseudoElements,
                observeMutationsRoot: observeMutationsRoot
            });
        });
    }
};

var autoReplace = function autoReplace() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _params$autoReplaceSv = params.autoReplaceSvgRoot,
        autoReplaceSvgRoot = _params$autoReplaceSv === void 0 ? DOCUMENT : _params$autoReplaceSv;
    if (Object.keys(namespace.styles).length > 0 && IS_DOM && config.autoReplaceSvg) api.dom.i2svg({
        node: autoReplaceSvgRoot
    });
};