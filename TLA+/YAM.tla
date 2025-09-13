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
    thread,
    clockState,
    buttonState, 
    buttonLabel

ClockStates == { STOPPED, RUNNING }
ButtonStates == { STOPPED, RUNNING }

Init ==
    /\ thread = << >>
    /\ clockState  = STOPPED 
    /\ buttonState = STOPPED 
    /\ buttonLabel = "Start" 

(* Append an event at the end of a sequence *)
enqueue(seq, event) ==
    Append(seq, event)

(* Dequeue head of a sequence, returning a record with head and tail *)
dequeue(seq) ==
    [ head |-> Head(seq), tail |-> Tail(seq) ]


(* Action: start/stop button click *)
Click ==
    /\ thread = << >>
    /\ thread' = enqueue(thread,EVENT_CLICK)
    /\ UNCHANGED << buttonLabel, buttonState >>
    /\ UNCHANGED << clockState >>


(* Action: toggle on start/stop button click *)
StartStop ==
    /\ thread # << >>
    /\ LET event == dequeue(thread) IN
           ( IF event.head = EVENT_CLICK /\ buttonState = STOPPED THEN
                /\ thread' = enqueue(event.tail, EVENT_START)
             ELSE IF event.head = EVENT_CLICK /\ buttonState = RUNNING  THEN
                /\ thread' = enqueue(event.tail, EVENT_STOP)
             ELSE
                /\ UNCHANGED thread)
    /\ UNCHANGED << buttonState, buttonLabel >>
    /\ UNCHANGED clockState

(* Event: clock started/stopped *)
ButtonEvent ==
    /\ thread # << >>
    /\ LET event == dequeue(thread) IN
           (IF event.head = EVENT_RUNNING THEN
               /\ buttonState' = RUNNING
               /\ buttonLabel' = "Stop"
               /\ thread' = event.tail
            ELSE IF event.head = EVENT_STOPPED THEN
               /\ buttonState' = STOPPED
               /\ buttonLabel' = "Start"
               /\ thread' = event.tail
            ELSE
               /\ UNCHANGED << buttonState, buttonLabel >>
               /\ UNCHANGED thread)
    /\ UNCHANGED << clockState >>


(* Event: clock start/stop *)
ClockEvent ==
    /\ thread # <<>>
    /\ LET event == dequeue(thread) IN
           ( IF event.head = EVENT_START /\ clockState = STOPPED THEN
                /\ clockState'  = RUNNING            
                /\ thread' = enqueue(event.tail, EVENT_RUNNING)
             ELSE IF event.head = EVENT_STOP /\ clockState # STOPPED  THEN
                /\ clockState' = STOPPED
                /\ thread' = enqueue(event.tail, EVENT_STOPPED)
             ELSE
                /\ UNCHANGED thread
                /\ UNCHANGED clockState)
    /\ UNCHANGED << buttonState, buttonLabel >>


(* Invariants *)
ClockInvariant ==
    clockState \in ClockStates

ToggleInvariant ==
    buttonState \in ButtonStates

LabelInvariant ==
       (buttonState = STOPPED /\ buttonLabel = "Start") 
    \/ (buttonState = RUNNING /\ buttonLabel = "Stop")    

=============================================================================
