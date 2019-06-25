/**
* @file syntaxer.js
* @author heyunfeng
*/

import { StartTagToken, EndTagToken } from './lexer.js';

class HTMLDocument {
    constructor() {
        this.isDocument = true;
        this.childrenNodes = [];
    }
}

class Node {}

class Text extends Node {
    constructor(value) {
        super(value);
        this.value = value || '';
    }
}

class Element extends Node {
    constructor(token) {
        super(token);
        for (let key in token) {
            this[key] = token[key];
        }
        this.childrenNodes = [];
    }
}

class HTMLSyntaticalParser {
    constructor() {
        this.stack = [new HTMLDocument()];
    }

    getTop() {
        return this.stack[this.stack.length - 1];
    }

    getOutput() {
        return this.stack[0];
    }

    receiveInput(token) {
        let topToken = this.getTop();
        if (typeof token === 'string') {
            if (topToken instanceof Text) {
                topToken.value += token;
            }
            else {
                let s = new Text(token);
                this.stack.push(s);
                topToken.childrenNodes.push(s);
            }
            return;
        }

        if (topToken instanceof Text) {
            this.stack.pop();
            topToken = this.getTop();
        }

        if (token instanceof StartTagToken) {
            let e = new Element(token);
            topToken.childrenNodes.push(e);
            this.stack.push(e);
            return;
        }

        if (token instanceof EndTagToken) {
            this.stack.pop();
            return;
        }
    }
}

export {
    HTMLSyntaticalParser
}