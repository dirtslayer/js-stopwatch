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
        this.dispatchEvent(new Event('stopped'));
    }

    isRunning = () => {
        return (this.intervalID != 'stopped');
    }

    reset = () => {
        const { startMilli } = this;
        this.milliLeft = startMilli;
        const x = startMilli;
        const updateEvent = new Event('update');
        updateEvent.data =  { startMilli, milliLeft:x };
        this.dispatchEvent(updateEvent);
    }
}

/**
* JSTimerView - Abstract View - listens for events
*/
class JSTimerView {

    /** 
    * Create a timer view
    * @param {HTMLElement} element - the element that is listening for timer events
    * @param {JSTimer} jstimerSource - the timer to listen too 
    * @param {Array} events - list of events to listen for ['tick','stopped','update']
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

        if ( events.includes('update') ) {
            jstimerSource.addEventListener('update', (e) => {
                this.doUpdate(e);
            });
        }      
    }

    /** 
    * abstract methods placeholder to handle tick messages from JSTimerSource
    * @param {Event} e - event that encapsulates the data
    */
    doTick = (e) => {
        console.log('warning: abstract view received tick message');
        console.dir(e);
    }
   doStop = (e) => {
        console.log('warning: abstract view received stop message');
        console.dir(e);
    }
    doUpdate = (e) => {
        console.log('warning: abstract view received update message');
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

class ResetButton {
    constructor(button,jstimer) {
        button.addEventListener('click', () => {
            jstimer.reset();
        } )
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

    doUpdate = (e) => {
        const { startMilli } = e.data; 
        this.element.innerText = startMilli / 100;      
    }
}

class TimerBarDisplay extends JSTimerView {
    doTick = (e) => {
        const { startMilli, milliLeft } = e.data;
        this.element.style.width = `${Math.floor(milliLeft * 100 / startMilli)}px` ;
    }

    doUpdate = (e) => {
        const { startMilli, milliLeft } = e.data;
        this.element.style.width = `${Math.floor(milliLeft * 100 / startMilli)}px`;      
    }
}

/** 
* Arc helper funtions swiped from here: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
*/
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  function describeArc(x, y, radius, startAngle, endAngle){
  
      var start = polarToCartesian(x, y, radius, endAngle);
      var end = polarToCartesian(x, y, radius, startAngle);
  
      var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
      var d = [
          "M", start.x, start.y, 
          "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(" ");
  
      return d;       
  }
  
/** 
* Draw svg arcs
*/
  window.onload = function() {
    document.getElementById("arc2").setAttribute("d", describeArc(145, 135, 80, 0, 359.999));
    document.getElementById("arc1").setAttribute("d", describeArc(145, 135, 80, 0, 359.999));
  };

/**
* Connect arcs to timer
* @extends JSTimerView
*/
  class TimerArcDisplay extends JSTimerView {
    doTick = (e) => {
        const { startMilli, milliLeft } = e.data;
        this.element.setAttribute("d", describeArc(145, 135, 80, 0, milliLeft * 359.99 / startMilli));
    }

    doUpdate = (e) => {
        const { startMilli, milliLeft } = e.data;
        this.element.setAttribute("d", describeArc(145, 135, 80, 0, milliLeft * 359.99 / startMilli));   
    }
}

/** 
* When they click text show input box instead
*/
const toggleinputON = () => {
    document.querySelector("#setclock").style.display = 'block';
    document.querySelector("#timeremaining").style.display = 'none'
    document.querySelector("#setclock").focus();
}

/** 
* When they are done with input box show time remaining
*/
const toggleinputOFF = () => {
    document.querySelector("#setclock").style.display = 'none';
    document.querySelector("#timeremaining").style.display = 'block'
}
/** 
* main - setup timers, controllers and views JSTimer / JSView
*/
    const timer = new JSTimer(6000);
    const startbutton = new StartStopButton(document.querySelector("#startstopButton"),timer,['stopped']); 
    const textdisplay = new TimerTextDisplay(document.querySelector("#timeremaining"),timer,['tick','update']);
    const resetbutton = new ResetButton(document.querySelector('#resetButton'),timer);
    const bardisplay = new TimerBarDisplay(document.querySelector('#bar'),timer,['tick','update']);
    const arcdisplay = new TimerArcDisplay(document.querySelector('#arc1'),timer,['tick','update']);
  

    const resetwithinput = () => {
        const x = document.querySelector("#setclock").value;
        toggleinputOFF();
        timer.stop();
        timer.startMilli = x * 100;
        timer.reset();
        console.log(x);
    }

    document.querySelector("#setclock").addEventListener("keyup", event => {
        if(event.key !== "Enter") return; // Use `.key` instead.
       resetwithinput(); // Things you want to do.
        event.preventDefault(); // No need to `return false;`.
    });

    document.querySelector("#setclock").addEventListener("focusout", resetwithinput);

