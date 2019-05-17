import configurations.Languages.configureJava

plugins {
    `java-library`
}

description = "A dead simple svg generation library written in pure Java, with no dependencies. This code runs on both desktop Java, Android, and compiles to Javascript with GWT."

configureJava()