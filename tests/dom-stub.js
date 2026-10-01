"use strict";

// Minimal DOM stand-in used to exercise the real script.js notification code
// in Node. It is deliberately small: it only implements the DOM surface that
// the notification control centre actually touches.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

class StubClassList {
    constructor(element) {
        this.element = element;
    }

    _values() {
        return String(this.element.className || "")
            .split(/\s+/)
            .filter(Boolean);
    }

    _write(values) {
        this.element.className = values.join(" ");
    }

    add(name) {
        const values = this._values();
        if (!values.includes(name)) values.push(name);
        this._write(values);
    }

    remove(name) {
        this._write(this._values().filter(value => value !== name));
    }

    contains(name) {
        return this._values().includes(name);
    }

    toggle(name, force) {
        const shouldAdd = force === undefined ? !this.contains(name) : Boolean(force);
        if (shouldAdd) this.add(name);
        else this.remove(name);
        return shouldAdd;
    }
}

class StubElement {
    constructor(tagName) {
        this.tagName = String(tagName || "div").toUpperCase();
        this.children = [];
        this.parentElement = null;
        this.attributes = {};
        this.dataset = {};
        this.style = { display: "" };
        this.classList = new StubClassList(this);
        this.className = "";
        this.id = "";
        this.type = "";
        this.placeholder = "";
        this.min = "";
        this.max = "";
        this.step = "";
        this.checked = false;
        this.disabled = false;
        this.href = "";
        this._textContent = "";
        this._value = "";
        this._listeners = new Map();
        this._innerHTML = "";
    }

    // The real DOM always hands back a string from `.value`, even for
    // <input type="number">. script.js relies on that (e.g. `.trim()`).
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value === undefined || value === null ? "" : String(value);
    }

    get textContent() {
        return this._textContent;
    }

    set textContent(value) {
        this._textContent = value === undefined || value === null ? "" : String(value);
        if (this._textContent === "") this.children = [];
    }

    get innerHTML() {
        return this._innerHTML;
    }

    set innerHTML(value) {
        this._innerHTML = value === undefined || value === null ? "" : String(value);
        if (this._innerHTML === "") this.children = [];
    }

    setAttribute(name, value) {
        this.attributes[name] = String(value);
    }

    getAttribute(name) {
        return Object.prototype.hasOwnProperty.call(this.attributes, name)
            ? this.attributes[name]
            : null;
    }

    removeAttribute(name) {
        delete this.attributes[name];
    }

    hasAttribute(name) {
        return Object.prototype.hasOwnProperty.call(this.attributes, name);
    }

    appendChild(child) {
        if (!child) return child;
        if (child.parentElement) child.parentElement.removeChild(child);
        child.parentElement = this;
        this.children.push(child);
        return child;
    }

    insertBefore(node, reference) {
        if (!node) return node;
        if (node.parentElement) node.parentElement.removeChild(node);
        node.parentElement = this;
        const index = this.children.indexOf(reference);
        if (index === -1) this.children.push(node);
        else this.children.splice(index, 0, node);
        return node;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) this.children.splice(index, 1);
        if (child) child.parentElement = null;
        return child;
    }

    remove() {
        if (this.parentElement) this.parentElement.removeChild(this);
    }

    addEventListener(type, handler) {
        if (typeof handler !== "function") return;
        if (!this._listeners.has(type)) this._listeners.set(type, []);
        this._listeners.get(type).push(handler);
    }

    dispatchEvent(event) {
        const type = event && event.type ? event.type : "click";
        const payload = event || {};
        if (!payload.target) payload.target = this;
        payload.type = type;
        const handlers = this._listeners.get(type) || [];
        for (const handler of handlers.slice()) handler.call(this, payload);
        return true;
    }

    click() {
        this.dispatchEvent({ type: "click", target: this });
    }

    focus() {}
    blur() {}
    scrollIntoView() {}

    closest(selector) {
        const wanted = String(selector || "").replace(/^\./, "");
        let node = this;
        while (node) {
            if (node.classList && node.classList.contains(wanted)) return node;
            node = node.parentElement;
        }
        return null;
    }

    descendants() {
        const out = [];
        const walk = node => {
            for (const child of node.children) {
                out.push(child);
                walk(child);
            }
        };
        walk(this);
        return out;
    }

    querySelectorAll(selector) {
        const wanted = String(selector || "").replace(/^\./, "");
        return this.descendants().filter(node => node.classList && node.classList.contains(wanted));
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }
}

function createDocument(htmlSource) {
    const body = new StubElement("body");

    // SVG elements expose geometry through baseVal; script.js reads the
    // progress ring radius when it paints the dashboard.
    const svgGeometry = {
        progressCircle: { r: { baseVal: { value: 60 } } }
    };

    const idPattern = /\sid="([^"]+)"/g;
    let match;
    while ((match = idPattern.exec(htmlSource)) !== null) {
        const element = new StubElement("div");
        element.id = match[1];
        if (svgGeometry[element.id]) {
            Object.assign(element, svgGeometry[element.id]);
        }
        body.appendChild(element);
    }

    const document = {
        body,
        documentElement: new StubElement("html"),
        head: new StubElement("head"),
        title: "Ace Tracker",
        createElement: tag => new StubElement(tag),
        createDocumentFragment: () => new StubElement("fragment"),
        createTextNode: text => {
            const node = new StubElement("#text");
            node.textContent = text;
            return node;
        },
        getElementById(id) {
            if (body.id === id) return body;
            return body.descendants().find(node => node.id === id) || null;
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        addEventListener() {},
        removeEventListener() {}
    };

    return document;
}

function createStorage(initial) {
    const map = new Map(Object.entries(initial || {}));
    return {
        getItem(key) {
            return map.has(key) ? map.get(key) : null;
        },
        setItem(key, value) {
            map.set(key, String(value));
        },
        removeItem(key) {
            map.delete(key);
        },
        clear() {
            map.clear();
        },
        snapshot() {
            return Object.fromEntries(map);
        }
    };
}

function stylesheetDisplayFor(cssSource, className) {
    const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
    const selector = "." + className;
    let display = null;
    let match;
    while ((match = rulePattern.exec(cssSource)) !== null) {
        const selectors = match[1].split(",").map(part => part.trim());
        if (!selectors.includes(selector)) continue;
        const declaration = /(?:^|;)\s*display\s*:\s*([^;]+)/.exec(match[2]);
        if (declaration) display = declaration[1].trim();
    }
    return display;
}

// Loads the real script.js inside a context whose globals are the stubs above.
// Top-level `function` declarations become properties of the context object,
// which is exactly what the tests need.
function loadApp({ storage, html, css, console: consoleStub }) {
    const document = createDocument(html);
    const windowStub = {
        location: { origin: "http://localhost:3000", href: "http://localhost:3000/" },
        addEventListener() {},
        removeEventListener() {},
        matchMedia() {
            return { matches: false, addEventListener() {}, removeEventListener() {} };
        },
        atob: value => Buffer.from(String(value), "base64").toString("binary"),
        btoa: value => Buffer.from(String(value), "binary").toString("base64"),
        scrollTo() {}
    };

    const context = {
        console: consoleStub || console,
        document,
        window: windowStub,
        localStorage: storage,
        navigator: {},
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        fetch: () => Promise.reject(new Error("network disabled in tests")),
        alert() {},
        confirm: () => true,
        prompt: () => null
    };
    context.self = context;
    context.top = context;

    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(ROOT, "script.js"), "utf8"), context, {
        filename: "script.js"
    });

    return { context, document, window: windowStub, cssDisplay: selector => stylesheetDisplayFor(css, selector) };
}

module.exports = {
    ROOT,
    StubElement,
    createDocument,
    createStorage,
    loadApp,
    readFile: name => fs.readFileSync(path.join(ROOT, name), "utf8"),
    stylesheetDisplayFor
};
