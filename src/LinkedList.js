module.exports = class LinkedList {
    constructor() {
        this.head = new ListNode();
        this.tail = new ListNode();
        this.length = 0;

        ListNode.link(this.head, this.tail);
    }

    /**
     * Add an item to the beginning of the list
     * @param value
     */
    push(value) {
        ListNode.link(this.tail.prev, new ListNode(value));
        this.length ++;
    }

    /**
     * Add an item to the beginning of the list
     * @param value @type
     */
    enqueue(value) {
        ListNode.link(this.head, new ListNode(value));
        this.length ++;
    }

    /**
     * Removes an item from the end of the list and returns it
     * @returns {*} item removed from the list
     */
    pop() {
        let result_node = this.tail.prev;

        if (result_node.id === this.head.id) {
            throw new Error("Nothing to pop");
        }

        ListNode.unlink(result_node);
        this.length --;

        return result_node.value;
    }

    /**
     * Removes an item from the end of the list and returns it
     * @returns {*} item removed from the list
     */
    dequeue() {
        return this.pop();
    }
};

class ListNode {
    static link(node1, node2) {
        let node3 = node1.next;

        node1.next = node2;
        node2.prev = node1;
        node2.next = node3;

        if (node3) {
            node3.prev = node2;
        }
    }

    static unlink(node) {
        let prev = node.prev;
        let next = node.next;

        if (prev) {
            prev.next = next;
        }

        if (next) {
            next.prev = prev;
        }

        node.next = null;
        node.prev = null;
    }

    constructor(value) {
        this.value = value;
        this.id = Symbol();
        this.next = null;
        this.prev = null;
    }
};