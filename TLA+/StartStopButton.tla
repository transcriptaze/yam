---- MODULE StartStopButton ----
EXTENDS YAM, TLC

(* Action: single start/stop button click *)
Click ==
    /\ thread = << >>
    /\ thread' = enqueue(thread,EVENT_CLICK)
    /\ UNCHANGED << buttonLabel, buttonState >>
    /\ UNCHANGED << clockState >>

(* Action: multipe start/stop button clicks *)
Clicks ==
    /\ Len(thread) < 2
    /\ thread' = enqueue(thread,EVENT_CLICK)
    /\ UNCHANGED << buttonLabel, buttonState >>
    /\ UNCHANGED << clockState >>

SingleClick ==
    \/ Click
    \/ StartStop
    \/ ClockEvent
    \/ ButtonEvent

DoubleClick ==
    \/ Clicks
    \/ StartStop
    \/ ClockEvent
    \/ ButtonEvent

=============================================================================
