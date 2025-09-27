run:
	rm -f StartStopButton_TTrace_*
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -dump ../workdir/START       -cleanup StartStopButton.tla -config StartClick.cfg
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -dump ../workdir/STOP        -cleanup StartStopButton.tla -config StopClick.cfg
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -dump ../workdir/START-START -cleanup StartStopButton.tla -config StartDoubleClick.cfg

debug:
	rm -f StartStopButton_TTrace_*
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -dump ../workdir/START       -cleanup StartStopButton.tla -config StartClick.cfg

start-click:
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -dump ../workdir/START       -cleanup StartStopButton.tla -config StartClick.cfg

stop-click:
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -dump ../workdir/STOP        -cleanup StartStopButton.tla -config StopClick.cfg

double-click:
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -dump ../workdir/START-START -cleanup StartStopButton.tla -config StartDoubleClick.cfg

help:
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -help

