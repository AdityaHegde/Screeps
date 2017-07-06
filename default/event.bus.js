let utils = require("utils");
let constants = require("constants");

module.exports = {
    listeners : {},

    subscribe : function(eventName, method, contextPath) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push({
            method : method,
            contextPath : contextPath,
        });
    },

    fire : function(eventName, target, args) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach((listener) => {
                listener.method.call(_.get(target, listener.contextPath), ...args);
            });
        }
    },
};
