import configurations.Languages.configureJava
import configurations.Languages.configureMavenPublication

description = "A copy of Chen Shuang's square 1 two phase solver."

plugins {
    `java-library`
    `maven-publish`
}

configureJava()
configureMavenPublication("scrambler-sq12phase")
