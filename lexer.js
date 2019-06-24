/**
* @file lexer.js
* @author heyunfeng
*/

class StartTagToken {}

class EndTagToken {}

class Attribute {}

class HTMLLexicalParser {

    constructor(syntax) {
        this.syntax = syntax;
        this.init();
    }

    init() {
        this.token = null;
        this.state = this.data;
        this.attribute = null;
        this.characterReference = '';
        this.letterReg = /[a-zA-Z]/;
        this.blackReg = /[/t/n/f ]/;
    }

    receiveInput(c) {
        if (this.state === null) {
            throw new Error('state is null');
        }
        this.state = this.state(c);
    }

    reset() {
        this.state = this.data;
    }

    data(c) {
        switch (c) {
            case '&':
                return this.characterReferenceInData;
            case '<':
                return this.tagOpen;
            default:
                this.emitToken(c);
                return this.data;
        }
    }

    characterReferenceInData(c) {
        if (c === ';') {
            this.characterReference += c;
            this.emitToken(this.characterReference);
            return this.data;
        }
        this.characterReference += c;
        return this.characterReferenceInData;
    }

    tagOpen(c) {
        if (c === '/') {
            return this.endTagOpen;
        }
        if (this.letterReg.test(c)) {
            this.token = new StartTagToken();
            this.token.name = c.toLowerCase();
            return this.tagName;
        }
        return this.error(c);
    }

    tagName(c) {
        if (c === '/') {
            return this.selfEndTag;
        }
        if (c === '>') {
            this.emitToken(this.token);
            return this.data;
        }
        if (this.letterReg.test(c)) {
            this.token.name += c.toLowerCase();
            return this.tagName;
        }
        if (this.blackReg.test(c)) {
            return this.beforeAttributeName;
        }
    }

    beforeAttributeName(c) {
        if (this.blackReg.test(c)) {
            return this.beforeAttributeName;
        }
        if (c === '/') {
            return this.selfEndTag;
        }
        if (c === '>') {
            this.emitToken(this.token);
            return this.data;
        }
        if (/["'<]/.test(c)) {
            return this.error(c);
        }

        this.attribute = new Attribute();
        this.attribute.name = c;
        this.attribute.value = '';
        return this.attributeName;
    }

    attributeName(c) {
        if (c === '/') {
            this.token[this.attribute.name] = this.attribute.value;
        }
        if (this.blackReg.test(c)) {
            this.token[this.attribute.name] = this.attribute.value;
            return this.beforeAttributeName;
        }
        if (c === '=') {
            return this.beforeAttributeValue;
        }
        this.attribute.name += c;
        return this.attributeName;
    }

    beforeAttributeValue(c) {
        if (c === '"') {
            return this.attributeDoubleQuotaValue;
        }
        if (c === '\'') {
            return this.attributeSingleQuotaValue;
        }
        if (this.blackReg.test(c)) {
            return this.beforeAttributeValue;
        }
        this.attribute.value = c;
        return this.attributeUnQuotaValue;
    }

    attributeDoubleQuotaValue(c) {
        if (c === '"') {
            this.token[this.attribute.name] = this.attribute.value;
            return this.beforeAttributeName;
        }
        this.attribute.value += c;
        return this.attributeDoubleQuotaValue;
    }

    attributeSingleQuotaValue(c) {
        if (c === '\'') {
            this.token[this.attribute.name] = this.attribute.value;
            return this.beforeAttributeName;
        }
        this.attribute.value += c;
        return this.attributeSingleQuotaValue;
    }

    attributeUnQuotaValue(c) {
        if (this.blackReg.test(c)) {
            this.token[this.attribute.name] = this.attribute.value;
            return this.beforeAttributeName;
        }
        this.attribute.value += c;
        return this.attributeUnQuotaValue;
    }

    endTagOpen(c) {
        if (c === '>') {
            return this.error(c);
        }
        if (this.letterReg.test(c)) {
            this.token = new EndTagToken();
            this.token.name = c.toLowerCase();
            return this.tagName;
        }
    }

    selfEndTag(c) {
        if (c === '>') {
            this.emitToken(this.token);
            let selfToken = new EndTagToken();
            selfToken.name = this.token.name;
            this.emitToken(selfToken);
            return this.data;
        }
    }

    error(c) {
        console.log(`this is error ${c}`);
    }

    emitToken(token) {
        this.syntax.receiveInput(token);
    }
}

module.exports = {
    HTMLLexicalParser,
    StartTagToken,
    EndTagToken
};
