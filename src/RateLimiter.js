const LinkedList = require('./LinkedList');
const EventEmitter = require('events');

/**
 * Limits the rate of calls to functions
 * @type {RateLimiter}
 */
module.exports = class RateLimiter extends EventEmitter {
    constructor(rate, time_unit) {
        super();

        this.rate = rate;
        this.time_unit = time_unit;
        this.queue = new LinkedList();
        this.interval = null;
        this.running = false;
        this.waiting = true;
    }

    /**
     * Schedule a task to run
     * @param cb
     * @param cb_args
     */
    schedule(cb, cb_args) {
        this.queue.enqueue(new Task(cb, cb_args));
        this.unwait();

        this.emit('scheduled');
    };

    /**
     * Called periodically to run enqueued callbacks
     */
    onInterval() {
        if (this.queue.length <= 0) {
            this.wait();
            return;
        }

        if (this.running) {
            const next = this.queue.dequeue();
            next.run();
        }
    }

    /**
     * Stop running the interval timer until start is called.
     */
    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.waiting = true;
        this.wait_once = false;
        this.running = false;

        this.emit('stop');
    }

    /**
     * Stop the interval timer since until there is a task available
     */
    wait() {
        if (this.wait_once) {
            clearInterval(this.interval);
            this.interval = null;
            this.waiting = true;

            this.wait_once = false;
            this.emit('wait');
            return;
        }

        this.wait_once = true;
    }

    /**
     * Start the interval timer and if not waiting, run the next task
     */
    unwait() {
        if (this.running) {
            let was_waiting = this.waiting;

            this.waiting = false;
            this.wait_once = false;

            if (was_waiting) {
                this.emit('unwait');

                let timeout_ms = Math.floor(this.time_unit / this.rate);

                this.interval = setInterval(() => this.onInterval(), timeout_ms);
                this.onInterval();
            }
        }
    }

    /**
     * Mark as running and start running tasks
     */
    start() {
        this.running = true;

        if (this.queue.length > 0) {
            this.unwait();
        }
    }
};


class Task {
    constructor(cb, cb_args) {
        this.cb = cb;
        this.cb_args = cb_args;
    }

    run() {
        if (this.cb_args) {
            (async () => await this.cb(this.cb_args))();
            return;
        }

        (async () => this.cb())();
    }
}