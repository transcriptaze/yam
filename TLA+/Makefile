run:
	rm -f StartStopButton_TTrace_*
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -cleanup StartStopButton.tla -config StartStopClick.cfg
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -cleanup StartStopButton.tla -config StartStopDoubleClick.cfg

help:
	java -XX:+UseParallelGC -cp ~/Development/tools/TLA+/tla2tools.jar tlc2.TLC -help
