package configurations

import org.gradle.api.JavaVersion
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

object CompilerSettings {
    const val JVM_TOOLCHAIN = 21

    const val JAVA_TARGET_RELEASE = 8

    val KOTLIN_JVM_TARGET = JvmTarget.JVM_1_8
    val JAVA_BYTECODE_VERSION = JavaVersion.VERSION_1_8
}
