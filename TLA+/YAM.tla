-------------------------------- MODULE YAM --------------------------------
EXTENDS
    Naturals,
    Sequences

CONSTANTS 
    STOPPED,
    RUNNING

CONSTANTS
    EVENT_CLICK,
    EVENT_START,
    EVENT_STOP,
    EVENT_RUNNING,
    EVENT_STOPPED

VARIABLES 
    ui,
    bus,
    clockState,
    buttonState, 
    buttonLabel

ClockStates == { STOPPED, RUNNING }
ButtonStates == { STOPPED, RUNNING }

Init ==
    /\ ui = << >>
    /\ bus = << >>
    /\ clockState  = STOPPED 
    /\ buttonState = STOPPED 
    /\ buttonLabel = "Start" 


(* Append an event at the end of a sequence *)
enqueue(seq, event) ==
    Append(seq, event)

(* Dequeue head of a sequence, returning a record with head and tail *)
dequeue(seq) ==
    [ head |-> Head(seq), tail |-> Tail(seq) ]


(* Action: toggle on start/stop button click *)
StartStop ==
    /\ ui # << >>
    /\ LET event == dequeue(ui) IN
           ( IF event.head = EVENT_CLICK /\ buttonState = STOPPED THEN
                /\ bus' = enqueue(bus, EVENT_START)
                /\ ui' = event.tail
             ELSE IF event.head = EVENT_CLICK /\ buttonState = RUNNING  THEN
                /\ bus' = enqueue(bus, EVENT_STOP)
                /\ ui' = event.tail
             ELSE
                /\ UNCHANGED ui
                /\ UNCHANGED bus)
    /\ UNCHANGED << buttonState, buttonLabel >>
    /\ UNCHANGED clockState

(* Event: clock started/stopped *)
ButtonEvent ==
    /\ bus # << >>
    /\ LET event == dequeue(bus) IN
           (IF event.head = EVENT_RUNNING THEN
               /\ buttonState' = RUNNING
               /\ buttonLabel' = "Stop"
               /\ bus' = event.tail
            ELSE IF event.head = EVENT_STOPPED THEN
               /\ buttonState' = STOPPED
               /\ buttonLabel' = "Start"
               /\ bus' = event.tail
            ELSE
               /\ UNCHANGED << buttonState, buttonLabel >>
               /\ UNCHANGED bus)
    /\ UNCHANGED ui
    /\ UNCHANGED << clockState >>


(* Event: clock start/stop *)
ClockEvent ==
    /\ bus # <<>>
    /\ LET event == dequeue(bus) IN
           ( IF event.head = EVENT_START /\ clockState = STOPPED THEN
                /\ clockState'  = RUNNING            
                /\ bus' = enqueue(event.tail, EVENT_RUNNING)
             ELSE IF event.head = EVENT_STOP /\ clockState # STOPPED  THEN
                /\ clockState' = STOPPED
                /\ bus' = enqueue(event.tail, EVENT_STOPPED)
             ELSE
                /\ UNCHANGED bus
                /\ UNCHANGED clockState)
    /\ UNCHANGED ui
    /\ UNCHANGED << buttonState, buttonLabel >>


(* State: running *)
Running ==
    /\ ui = << >>
    /\ bus = << >>
    /\ buttonState = RUNNING
    /\ buttonLabel = "Stop"
    /\ clockState = RUNNING
    /\ UNCHANGED << ui, bus, clockState, buttonState, buttonLabel >>

(* State: stopped *)
Stopped ==
    /\ ui = << >>
    /\ bus = << >>
    /\ buttonState = STOPPED
    /\ buttonLabel = "Start"
    /\ clockState = STOPPED
    /\ UNCHANGED << ui, bus, clockState, buttonState, buttonLabel >>


(* Invariants *)
ClockInvariant ==
    clockState \in ClockStates

ToggleInvariant ==
    buttonState \in ButtonStates

LabelInvariant ==
       (buttonState = STOPPED /\ buttonLabel = "Start") 
    \/ (buttonState = RUNNING /\ buttonLabel = "Stop")    

=============================================================================
