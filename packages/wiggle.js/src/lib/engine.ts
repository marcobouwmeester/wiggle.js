import {WiggleHTMLTags} from '../types/html';

export interface WiggleFiber {
    dom?: HTMLElement | Text | null;
    parent?: WiggleFiber;
    sibling?: WiggleFiber;
    child?: WiggleFiber;
    key?: string;
    type?: 'TEXT_ELEMENT' | WiggleHTMLTags;
    props?: {children?: WiggleFiber[]; value?: string};
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

    performUnitOfWork(fiber: WiggleFiber) {
        if (!fiber.dom) {
            fiber.dom = this.createDom(fiber);
        }

        if (fiber.parent) {
            fiber.parent.dom!.appendChild(fiber.dom!);
        }

        const elements = fiber.props?.children || [];
        let index = 0;
        let prevSibling: WiggleFiber = {};
        while (index < elements.length) {
            const element = elements[index];
            const newFiber = {
                type: element.type,
                props: element.props,
                parent: fiber,
                dom: null,
            } as WiggleFiber;
            if (index === 0) {
                fiber.child = newFiber;
            } else {
                prevSibling.sibling = newFiber;
            }
            prevSibling = newFiber;
            index++;
        }

        if (fiber.child) {
            return fiber.child;
        }
        let nextFiber = fiber;
        while (nextFiber) {
            if (nextFiber.sibling) return nextFiber.sibling;
            nextFiber = nextFiber.parent!;
        }
    }

    createDom(fiber: WiggleFiber) {
        if (!fiber.type) return;
        const domEl =
            fiber.type === 'TEXT_ELEMENT'
                ? document.createTextNode(fiber.props?.value || '')
                : document.createElement(fiber.type);

        return domEl;
    }
}
