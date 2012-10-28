mv test.java test.jav
rm -rf cs ui *.class &&
javac -source 1.3 -target 1.1 -g:none -O -d . *.java &&
cp -f *.java cs/min2phase/
jar cfe twophase.jar ui.MainProgram ui/*.class cs/min2phase/*.class cs/min2phase/*.java &&
rm -rf cs ui *.class &&
mv test.jav test.java

