import {WiggleHTMLTags} from '../types/html';

export interface WiggleFiber {
    dom?: HTMLElement | Text | null;
    parent?: WiggleFiber;
    sibling?: WiggleFiber;
    child?: WiggleFiber;
    key?: string;
    type?: 'TEXT_ELEMENT' | WiggleHTMLTags;
    props?: {children?: WiggleFiber[]; [_: string]: any};
}

interface IRenderEngineProps extends WiggleFiber {}

export default class RenderEngine {
    nextUnitOfWork: WiggleFiber;

    constructor(firstUnitOfwork: IRenderEngineProps) {
        this.nextUnitOfWork = firstUnitOfwork;
        requestIdleCallback(this.workLoop);
    }
    workLoop = (deadline: IdleDeadline) => {
        let shouldYield = false;
        while (this.nextUnitOfWork && !shouldYield) {
            this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork)!;
            shouldYield = deadline.timeRemaining() < 1;
        }
        requestIdleCallback(this.workLoop);
    };

    /**
     * Create a DOM node for each fiber. Append the node to the DOM if it has a parent.
     */
    performUnitOfWork(fiber: WiggleFiber) {
        if (!fiber.dom) fiber.dom = this.createDom(fiber);
        if (fiber.parent) fiber.parent.dom!.appendChild(fiber.dom!);

        this.performWhileLoop(fiber, fiber.props?.children || [], {});

        if (fiber.child) return fiber.child;

        let nextFiber = fiber;
        while (nextFiber) {
            if (nextFiber.sibling) return nextFiber.sibling;
            nextFiber = nextFiber.parent!;
        }
    }

    /**
     * Create a fiber for each child element
     */
    performWhileLoop(fiber: WiggleFiber, elements: WiggleFiber[], prevSibling: WiggleFiber) {
        let index = 0;
        while (index < elements.length) {
            const element = elements[index];
            const newFiber = {
                ...element,
                parent: fiber,
            };

            if (index === 0) fiber.child = newFiber;
            else prevSibling.sibling = newFiber;
            prevSibling = newFiber;
            index++;
        }
    }

    renderTextNode(fiber: WiggleFiber) {
        return document.createTextNode(fiber.props?.value || '');
    }

    renderHtmlNode(fiber: WiggleFiber) {
        const element = document.createElement(fiber.type!);
        return element;
    }

    createDom(fiber: WiggleFiber) {
        if (!fiber.type) return;
        const renderFn = fiber.type === 'TEXT_ELEMENT' ? this.renderTextNode : this.renderHtmlNode;

        return renderFn(fiber);
    }
}
