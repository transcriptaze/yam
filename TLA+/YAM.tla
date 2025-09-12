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


(* Action: start/stop button click *)
Click ==
    /\ thread = << >>
    /\ thread' = thread \o << EVENT_CLICK >>
    /\ UNCHANGED << buttonLabel, buttonState >>
    /\ UNCHANGED << clockState >>


(* Action: toggle on start/stop button click *)
StartStop ==
    /\ thread # << >>
    /\ LET e == Head(thread) IN
           ( IF e = EVENT_CLICK /\ buttonState = STOPPED THEN
                /\ thread' = Tail(thread) \o << EVENT_START >>
             ELSE IF e = EVENT_CLICK /\ buttonState = RUNNING  THEN
                /\ thread' = Tail(thread) \o << EVENT_STOP >>
             ELSE
                /\ UNCHANGED thread)
    /\ UNCHANGED << buttonState, buttonLabel >>
    /\ UNCHANGED clockState

(* Event: clock started/stopped *)
ButtonEvent ==
    /\ thread # << >>
    /\ LET e == Head(thread) IN
           (IF e = EVENT_RUNNING THEN
               /\ buttonState' = RUNNING
               /\ buttonLabel' = "Stop"
               /\ thread' = Tail(thread)
            ELSE IF e = EVENT_STOPPED THEN
               /\ buttonState' = STOPPED
               /\ buttonLabel' = "Start"
               /\ thread' = Tail(thread)
            ELSE
               /\ UNCHANGED << buttonState, buttonLabel >>
               /\ UNCHANGED thread)
    /\ UNCHANGED << clockState >>


(* Event: clock start/stop *)
ClockEvent ==
    /\ thread # <<>>
    /\ LET e == Head(thread) IN
           ( IF e = EVENT_START /\ clockState = STOPPED THEN
                /\ clockState'  = RUNNING            
                /\ thread' = Tail(thread) \o << EVENT_RUNNING >>
             ELSE IF e = EVENT_STOP /\ clockState # STOPPED  THEN
                /\ clockState' = STOPPED
                /\ thread' = Tail(thread) \o << EVENT_STOPPED >>
             ELSE
                /\ UNCHANGED thread
                /\ UNCHANGED clockState)
    /\ UNCHANGED << buttonState, buttonLabel >>

Step ==
    \/ Click
    \/ StartStop
    \/ ClockEvent
    \/ ButtonEvent


=============================================================================
