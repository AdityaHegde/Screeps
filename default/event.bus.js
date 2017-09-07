/* globals _ */

let listeners = {};

module.exports = {
    subscribe: function (eventName, method, contextPath) {
        listeners[eventName] = listeners[eventName] || [];
        listeners[eventName].push({
            method: method,
            contextPath: contextPath
        });
    },

    fire: function (eventName, target, ...args) {
        if (listeners[eventName]) {
            listeners[eventName].forEach((listener) => {
                let context = _.get(target, listener.contextPath);
                context[listener.method](...args);
            });
        }
    }
};
