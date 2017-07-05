let utils = require("utils");
let constatns = require("constants");

module.exports = {
    listeners : {},

    subscribe : function(eventName, method, data, context) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push({
            method : method,
            data : data,
            context : context,
        });
    },

    fire : function(eventName, args) {
        
    },
};
