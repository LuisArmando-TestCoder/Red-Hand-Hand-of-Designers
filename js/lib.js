HTMLElement.prototype.addEventListeners = function(eventsNames, callbackStack, options) {
    /** mu by LuisArmando-TestCoder
     * eventsNames -> array fill of strings of DOM events
     * callbackStack -> array fill with functions or just one function
     * options -> Object that specifies characteristics about the event listener  
        * read more about the options parameter here
        * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * 
    */
    eventsNames.forEach((eventName, i) => {
        if(typeof callbackStack === 'function') {
            this.addEventListener(eventName, event => 
            callbackStack(event, {eventName, eventIndex: i}), options);

        } else if(typeof callbackStack === 'object') {
            if(eventsNames.length != callbackStack.length) {
                console.error('eventsNames.length must be same as callbackStack.length');
            }

            this.addEventListener(eventName, event => 
            callbackStack[i](event, {eventName, eventIndex: i}), options);

        }        
    });
}

function deliverKeyCall(e) {
    switch(e.which) {
        case 81: // q and Q
            M.publish('create-line').topic(e);
            break;
    }
}