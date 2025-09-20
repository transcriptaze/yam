---- MODULE StartStopButton ----
EXTENDS YAM, TLC

(* Action: stopped, single start/stop button click *)
Start ==
    /\ ui = << EVENT_CLICK >>
    /\ bus = << >>
    /\ clockState  = STOPPED 
    /\ buttonState = STOPPED 
    /\ buttonLabel = "Start" 

(* Action: running, single start/stop button click *)
Stop ==
    /\ ui = << EVENT_CLICK >>
    /\ bus = << >>
    /\ clockState  = RUNNING 
    /\ buttonState = RUNNING 
    /\ buttonLabel = "Stop" 

ExecStart ==
    \/ StartStop
    \/ ClockEvent
    \/ ButtonEvent
    \/ Running

ExecStop ==
    \/ StartStop
    \/ ClockEvent
    \/ ButtonEvent
    \/ Stopped

StartSpec == Start /\ [][ExecStart]_<<ui, bus, clockState, buttonState, buttonLabel>>
StopSpec  == Stop  /\ [][ExecStop]_<<ui, bus, clockState, buttonState, buttonLabel>>

=============================================================================
