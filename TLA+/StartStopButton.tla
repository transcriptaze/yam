---- MODULE StartStopButton ----
EXTENDS YAM, TLC

SingleClick ==
    \/ Click
    \/ StartStop
    \/ ClockEvent
    \/ ButtonEvent

=============================================================================
