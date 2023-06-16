export default class Phase {

    constructor(id, func, args = [], blocked = false, active = true) {
        this.id = id;
        this.func = func;
        this.args = args;
        this.blocked = blocked;
        this.active = active;
    }

    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }

    getArgs() {
        return this.args
    }
    setArgs(args) {
        this.args = args
    }

    isBlocked() {
        return this.blocked
    }
    setBlocked(blocked) {
        this.blocked = blocked
    }

    isActive() {
        return this.active;
    }
    setActive(active) {
        this.active = active;
    }
}