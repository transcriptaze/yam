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
    /\ UNCHANGED << buttonState, buttonLabel, clockState >>
    /\ LET event == dequeue(ui) IN
           IF event.head = EVENT_CLICK /\ buttonState = STOPPED THEN
              /\ bus' = enqueue(bus, EVENT_START)
              /\ ui' = event.tail
           ELSE IF event.head = EVENT_CLICK /\ buttonState = RUNNING  THEN
              /\ bus' = enqueue(bus, EVENT_STOP)
              /\ ui' = event.tail
           ELSE
              /\ UNCHANGED << ui, bus >>

(* Event: clock started/stopped *)
ButtonEvent ==
    /\ bus # << >>
    /\ UNCHANGED << ui, clockState >>
    /\ LET event == dequeue(bus) IN
           IF event.head = EVENT_RUNNING THEN
              /\ buttonState' = RUNNING
              /\ buttonLabel' = "Stop"
              /\ bus' = event.tail
           ELSE IF event.head = EVENT_STOPPED THEN
              /\ buttonState' = STOPPED
              /\ buttonLabel' = "Start"
              /\ bus' = event.tail
           ELSE
              /\ UNCHANGED << bus, buttonState, buttonLabel >>


(* Event: clock start/stop *)
ClockEvent ==
    /\ bus # <<>>
    /\ UNCHANGED << ui, buttonState, buttonLabel >>
    /\ LET event == dequeue(bus) IN
           IF event.head = EVENT_START /\ clockState = STOPPED THEN
              /\ clockState'  = RUNNING            
              /\ bus' = enqueue(event.tail, EVENT_RUNNING)
           ELSE IF event.head = EVENT_STOP /\ clockState # STOPPED  THEN
              /\ clockState' = STOPPED
              /\ bus' = enqueue(event.tail, EVENT_STOPPED)
           ELSE
              /\ UNCHANGED << bus, clockState >>


(* Action: run *)
Run ==
    /\ ui = << >>
    /\ bus = << >>
    /\ clockState = RUNNING
    /\ buttonState = RUNNING
    /\ buttonLabel = "Stop"
    /\ clockState' = RUNNING
    /\ UNCHANGED << ui, bus, clockState, buttonState, buttonLabel >>


(* State: stopped *)
Stopped ==
    /\ ui = << >>
    /\ bus = << >>
    /\ buttonState = STOPPED
    /\ buttonLabel = "Start"
    /\ clockState = STOPPED

(* State: running *)
Running ==
    /\ ui = << >>
    /\ bus = << >>
    /\ buttonState = RUNNING
    /\ buttonLabel = "Stop"
    /\ clockState = RUNNING


(* Properties *)
Started ==
    <>Running

(* Invariants *)
ClockInvariant ==
    clockState \in ClockStates

ToggleInvariant ==
    buttonState \in ButtonStates

LabelInvariant ==
       (buttonState = STOPPED /\ buttonLabel = "Start") 
    \/ (buttonState = RUNNING /\ buttonLabel = "Stop")    

=============================================================================
