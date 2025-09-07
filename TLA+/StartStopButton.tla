---- MODULE StartStopButton ----
EXTENDS YAM, TLC

ClockInvariant ==
    clockState \in ClockStates

ToggleInvariant ==
    buttonState \in ButtonStates

LabelInvariant ==
       (buttonState = STOPPED /\ buttonLabel = "Start") 
    \/ (buttonState = RUNNING /\ buttonLabel = "Stop")    

=============================================================================
