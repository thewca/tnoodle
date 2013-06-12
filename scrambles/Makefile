GWT_DIR=gwt/
GWT_EXPORTER_JAR=../lib/gwtexporter-2.5.0-SNAPSHOT.jar
CLASSPATH=postprocessed:src:../utils/src:../threephase/src:../min2phase/src:../sq12phase/src:../lib/lib-gwt-svg-0.5.7.jar:../lib/gwt-awt-0.0.3-SNAPSHOT.jar:$(GWT_EXPORTER_JAR):$(GWT_DIR)*

GWT_MODULE=scrambles
GWT_PACKAGES_DOCUMENT=net.gnehzr.tnoodle.js net.gnehzr.tnoodle.scrambles puzzle

JAVA_SOURCES=$(shell find src/ -name '*.java')

all: compile

PUZZLE_LIST=$(shell awk 1 ORS='\\\\n' src/puzzle/puzzles)
VERSION=$(shell ../tmt describe)
postprocessed/net/gnehzr/tnoodle/js/ScrambleJsEntryPoint.java: src/net/gnehzr/tnoodle/js/ScrambleJsEntryPoint.java
	mkdir -p `dirname $@`
	cat $< | sed 's/%%PUZZLES%%/$(PUZZLE_LIST)/g' | sed 's/%%VERSION%%/$(VERSION)/g' > $@

war/gwting/gwting.nocache.js: $(JAVA_SOURCES) $(GWT_DIR) postprocessed/net/gnehzr/tnoodle/js/ScrambleJsEntryPoint.java
	java -cp "$(CLASSPATH)" com.google.gwt.dev.Compiler -strict -style PRETTY $(GWT_MODULE)

compile: war/gwting/gwting.nocache.js

doc/jsdoc.html: $(JAVA_SOURCES) $(GWT_DIR)
	# This seems to blow up with jdk7
	javadoc -public -verbose -sourcepath src -classpath "$(CLASSPATH)" -d doc -docletpath $(GWT_EXPORTER_JAR) -doclet org.timepedia.exporter.doclet.JsDoclet $(GWT_PACKAGES_DOCUMENT)

doc: doc/jsdoc.html

clean:
	rm -rf gwt-unitCache
	rm -rf war
	rm -rf doc
	rm -rf postprocessed

.PHONY: all compile doc clean
