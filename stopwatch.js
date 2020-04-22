/**
* JSTimer is the Model that has timer data and emits tick events
* @extends EventTarget
*/
class JSTimer extends EventTarget {

    /** 
    * JSTimer constructor.
    * @param {Number} startMilli - the amount of milliseconds to count down from
    * TODO: add frequency of tic
    */
    constructor(startMilli = 6000) {
        super();
        this.intervalID = 'stopped';
        this.startMilli = startMilli;
        this.milliLeft = startMilli;

    }

    /** 
    * Sends tick message to all listeners
    */   
    broadcastTick = () => {
        const { startMilli , milliLeft} = this;
        if (milliLeft < 0 ) {
            this.stop();
        } else {
            this.milliLeft -= 100;
            const tickEvent = new Event('tick');
            tickEvent.data = { startMilli, milliLeft };
            this.dispatchEvent(tickEvent);
        }
    }

    /** 
    * Sends stopped message to all listeners
    */
    broadcastStop = () => {
        this.dispatchEvent(new Event('stopped'));
    }

    /** 
    * Start the timer
    *
    */   
    start = () => {
        this.broadcastTick();
        this.intervalID = setInterval(() => { this.broadcastTick() }, 100);
    }
    
    /** 
    * Stop the timer
    */   
    stop = () => {
        clearInterval(this.intervalID);
        this.intervalID = 'stopped';
        this.broadcastStop();
    }

    isRunning = () => {
        return (this.intervalID != 'stopped');
    }

}

/**
* JSTimerView - Abstract View - listens for tick events
*/
class JSTimerView {

    /** 
    * Create a timer view
    * @param {HTMLElement} element - the element that is listening for timer events
    * @param {JSTimer} jstimerSource - the timer to listen too 
    * @param {Array} events - list of events to listen for ['tick','stopped']
    */  
    constructor(element, jstimerSource, events) {
        this.element = element;
        this.jstimerSource = jstimerSource;

        if ( events.includes('tick') ) {
            jstimerSource.addEventListener('tick', (e) => {
                this.doTick(e);
            });
        }
        
        if ( events.includes('stopped') ) {
            jstimerSource.addEventListener('stopped', (e) => {
                this.doStop(e);
            });
        }
        
    }

    /** 
    * abstract method placeholder to handle tick messages from JSTimerSource
    * @param {Event} e - event that encapsulates the data
    */
    doTick = (e) => {
        console.log('warning: abstract view received tick message');
        console.dir(e);
    }

    
    /** 
    * abstract method placeholder to handle tick messages from JSTimerSource
    * @param {Event} e - event that encapsulates the data
    */
   doStop = (e) => {
        console.log('warning: abstract view received stop message');
        console.dir(e);
    }

}
/**
* Create a timer start button from an HTML Button
*/
class StartStopButton extends JSTimerView {

    /** 
    * Constructor connects a button to a timer
    * @param {HTMLButton} button - button that will invoke jstimer.start
    * @param {JSTimer} jstimer - timer to use
    */    
    constructor(button,jstimer, events = ['stopped']) {
        super(button,jstimer,events);
        button.addEventListener('click', () => {
            if ( jstimer.isRunning() ) {
                jstimer.stop();
                button.innerText = '▶️';
            } else {
                jstimer.start();
                button.innerText = '⏹️';
            }
        }
        );       
    }

    doStop = (e) => {
        this.element.innerText = '▶️';
    }

}

/**
* TimerTextDisplay displays the current time left
* @extends JSTimerView
*/
class TimerTextDisplay extends JSTimerView {
    doTick = (e) => {
        const { milliLeft } = e.data;
        this.element.innerText = milliLeft / 100;
    }
}

/** 
* main - setup timers, controllers and views JSTimer / JSView
*/
main = () => {
    const timer = new JSTimer(6000);
    const startbutton = new StartStopButton(document.querySelector("#startstopButton"),timer,['stopped']); 
    const textdisplay = new TimerTextDisplay(document.querySelector("#timeremaining"),timer,['tick']);
}

main();