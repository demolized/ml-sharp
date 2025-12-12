/*!
 * jquery.event.move
 *
 * 1.3.6
 *
 * Stephen Band
 *
 * Triggers 'movestart', 'move' and 'moveend' events after
 * mousemoves following a mousedown cross a distance threshold,
 * similar to the native 'dragstart', 'drag' and 'dragend' events.
 * Move events are throttled to animation frames. Move event objects
 * have the properties:
 *
 * pageX:
 * pageY:     Page coordinates of pointer.
 * startX:
 * startY:    Page coordinates of pointer at movestart.
 * distX:
 * distY:     Distance the pointer has moved since movestart.
 * deltaX:
 * deltaY:    Distance the pointer has moved since last move.
 *
 * Forked from the original by Stephen Band
 * Simplified version for twentytwenty usage
 */

(function (module) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], module);
    } else {
        module(jQuery);
    }
})(function(jQuery, undefined){

    var threshold = 8;   // pixels

    var add = jQuery.event.add,
        remove = jQuery.event.remove,
        trigger = function(node, type, data) {
            // Create a jQuery event with the data properties
            var event = jQuery.Event(type, data);
            jQuery(node).trigger(event);
        };

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    function preventDefault(e) {
        e.preventDefault();
    }

    function isLeftButton(e) {
        return (e.which === 1);
    }

    function identifiedTouch(touchList, id) {
        var i, l;
        if (touchList.identifiedTouch) {
            return touchList.identifiedTouch(id);
        }
        i = -1;
        l = touchList.length;
        while (++i < l) {
            if (touchList[i].identifier === id) {
                return touchList[i];
            }
        }
    }

    // Constructors

    function Timer(fn){
        var callback = fn,
            active = false,
            running = false;

        function trigger(time) {
            if (active){
                callback();
                requestAnimationFrame(trigger);
                running = true;
                active = false;
            }
            else {
                running = false;
            }
        }

        this.kick = function(fn) {
            active = true;
            if (!running) { trigger(); }
        };

        this.end = function(fn) {
            var cb = callback;
            if (!fn) { return; }
            if (!running) {
                fn();
            }
            else {
                callback = active ?
                    function(){ cb(); fn(); } :
                    fn ;
                active = true;
            }
        };
    }

    function Move(e) {
        this.target = e.target;
        this.pageX = e.pageX;
        this.pageY = e.pageY;
        this.identifier = e.identifier;
        this.type = 'move';
    }

    Move.prototype = {
        preventDefault: preventDefault
    };

    // Move event handling

    var touchevents = {
        move: 'touchmove',
        cancel: 'touchend touchcancel'
    };

    var mouseevents = {
        move: 'mousemove',
        cancel: 'mouseup'
    };

    function setupMove(data) {
        var events = data.identifier === undefined ? mouseevents : touchevents;

        function moveHandler(e) {
            var touch = data.identifier === undefined ?
                    e :
                    identifiedTouch(e.changedTouches, data.identifier);

            if (!touch) { return; }

            e.pageX = touch.pageX;
            e.pageY = touch.pageY;
            e.identifier = data.identifier;

            data.distX = touch.pageX - data.startX;
            data.distY = touch.pageY - data.startY;
            data.deltaX = touch.pageX - data.pageX;
            data.deltaY = touch.pageY - data.pageY;

            data.pageX = touch.pageX;
            data.pageY = touch.pageY;

            if (!data.moves) {
                if ((data.distX * data.distX) + (data.distY * data.distY) < (threshold * threshold)) {
                    return;
                }

                trigger(data.target, 'movestart', data);
                data.moves = true;
            }

            e.type = 'move';
            trigger(data.target, 'move', e);
        }

        function cancelHandler(e) {
            var touch = data.identifier === undefined ?
                    e :
                    identifiedTouch(e.changedTouches, data.identifier);

            if (!touch) { return; }

            remove(document, events.move, moveHandler);
            remove(document, events.cancel, cancelHandler);

            if (data.moves) {
                trigger(data.target, 'moveend', data);
            }
        }

        add(document, events.move, moveHandler);
        add(document, events.cancel, cancelHandler);
    }

    function activateMouse(e) {
        if (!isLeftButton(e)) { return; }

        var data = {
            target: e.target,
            startX: e.pageX,
            startY: e.pageY,
            pageX: e.pageX,
            pageY: e.pageY,
            distX: 0,
            distY: 0,
            deltaX: 0,
            deltaY: 0,
            moves: false
        };

        setupMove(data);
    }

    function activateTouch(e) {
        var touch = e.changedTouches[0];

        var data = {
            target: touch.target,
            startX: touch.pageX,
            startY: touch.pageY,
            pageX: touch.pageX,
            pageY: touch.pageY,
            distX: 0,
            distY: 0,
            deltaX: 0,
            deltaY: 0,
            identifier: touch.identifier,
            moves: false
        };

        setupMove(data);
    }

    add(document, 'mousedown', activateMouse);
    add(document, 'touchstart', activateTouch);

    // Make jQuery copy touch event properties over to the jQuery event
    // object, if they are not already listed
    // Note: jQuery.event.props was removed in jQuery 3.0+, so we need to check if it exists
    if (jQuery.event.props && Array.isArray(jQuery.event.props)) {
        if (!jQuery.event.props.includes('pageX')) {
            jQuery.event.props.push('pageX', 'pageY');
        }
        if (!jQuery.event.props.includes('identifier')) {
            jQuery.event.props.push('identifier');
        }
    }
});
