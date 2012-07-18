rm -rf cs 
javac -d . -cp twophase.jar src/*.java
cp src/*.java cs/threephase/
jar -cfm threephase.jar META-INF/MANIFEST.MF cs twophase.jar

