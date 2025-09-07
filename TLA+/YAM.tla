-------------------------------- MODULE YAM --------------------------------
EXTENDS
    Naturals,
    Sequences

CONSTANTS 
    STOPPED,
    RUNNING

CONSTANTS
    EVENT_START,
    EVENT_STOP,
    EVENT_RUNNING,
    EVENT_STOPPED

VARIABLES 
    clockState,
    clockQueue,
    buttonState, 
    buttonLabel,
    buttonQueue

ClockStates == { STOPPED, RUNNING }
ButtonStates == { STOPPED, RUNNING }


Init ==
    /\ clockState = STOPPED
    /\ clockQueue = << >>
    /\ buttonState = STOPPED
    /\ buttonLabel = "Start"
    /\ buttonQueue = << >>

(* Action: toggle on start/stop button click *)
StartStop ==
    \/ /\ buttonState = STOPPED 
       /\ clockQueue  = <<  >>
       /\ clockQueue' = clockQueue \o << EVENT_START >>
       /\ UNCHANGED << buttonLabel, buttonState, buttonQueue >>
       /\ UNCHANGED << clockState >>

    \/ /\ buttonState = RUNNING 
       /\ clockQueue  = <<  >>
       /\ clockQueue' = clockQueue \o << EVENT_STOP >>
       /\ UNCHANGED << buttonLabel, buttonState, buttonQueue >>
       /\ UNCHANGED << clockState >>


(* Event: clock started/stopped *)
ButtonEvent ==
    /\ buttonQueue # << >>
    /\ LET e == Head(buttonQueue) IN
           (IF e = EVENT_RUNNING THEN
               /\ buttonState' = RUNNING
               /\ buttonLabel' = "Stop"
            ELSE IF e = EVENT_STOPPED THEN
               /\ buttonState' = STOPPED
               /\ buttonLabel' = "Start"
            ELSE
               /\ UNCHANGED buttonState
               /\ UNCHANGED buttonLabel)
    /\ buttonQueue' = Tail(buttonQueue)
    /\ UNCHANGED <<clockState, clockQueue>>


(* Event: clock start/stop *)
ClockEvent ==
    /\ clockQueue # <<>>
    /\ LET e == Head(clockQueue) IN
           (IF e = EVENT_START /\ clockState = STOPPED THEN
               /\ clockState'  = RUNNING            
               /\ buttonQueue  = <<  >> 
               /\ buttonQueue' = buttonQueue \o << EVENT_RUNNING >>
            ELSE IF e = EVENT_STOP /\ clockState # STOPPED  THEN
               /\ clockState'  = STOPPED
               /\ buttonQueue  = <<  >>
               /\ buttonQueue' = buttonQueue \o << EVENT_STOPPED >>
            ELSE
               /\ UNCHANGED clockState
               /\ UNCHANGED buttonQueue)
    /\ clockQueue' = Tail(clockQueue)
    /\ UNCHANGED <<buttonState, buttonLabel>>

Step ==
    \/ StartStop
    \/ ClockEvent
    \/ ButtonEvent


=============================================================================
