import RenderEngine, {WiggleFiber} from './lib/engine';
import {WiggleHTMLTags} from './types/html';

type WiggleDomBase = {
    key: string | number;
};

export type WiggleDomText = WiggleDomBase & {
    type: 'text';
    value: string;
};

export type WiggleDomElement = WiggleDomBase & {
    type: 'element';
    tagname: WiggleHTMLTags;
    children?: WiggleNode[];
    props?: {[_: string]: any};
};

export type WiggleNode = WiggleDomText | WiggleDomElement;

function render(rootDomEl: HTMLElement, element: WiggleFiber) {
    const rootEl = {
        dom: rootDomEl,
        props: {
            children: [element],
        },
    };
    new RenderEngine(rootEl);
}

const WiggleJs = {
    render,
};

export default WiggleJs;
