package dependencies

object Versions {
    val GWT = "2.5.1"
    val JUNIT_JUPITER = "5.4.2"
    val BATIK = "1.12"
    val KOTLIN = "1.3.60"
    val KTOR = "1.2.4"
    val PROGUARD = "6.2.0"

    val GWTEXPORTER = GWT
    val MARKDOWNJ_CORE = "0.4"
    val ZIP4J = "2.2.4"
    val ITEXTPDF = "5.5.13.1"
    val BATIK_TRANSCODER = BATIK
    val SNAKEYAML = "1.25"
    val NATIVE_TRAY_ADAPTER = "1.2-SNAPSHOT"
    val APPLEJAVAEXTENSIONS = "1.4"
    val BOUNCYCASTLE = "1.64"
    val JUNIT_JUPITER_API = JUNIT_JUPITER
    val JUNIT_JUPITER_ENGINE = JUNIT_JUPITER
    val KOTLIN_STDLIB_JVM = KOTLIN
    val KOTLIN_STDLIB_JS = KOTLIN
    val KOTLIN_STDLIB_COMMON = KOTLIN
    val KTOR_SERVER_CIO = KTOR
    val KTOR_SERVER_NETTY = KTOR
    val KTOR_GSON = KTOR
    val KTOR_SERVER_HOST_COMMON = KTOR
    val LOGBACK_CLASSIC = "1.2.3"
    val KOTLIN_ARGPARSER = "2.0.7"
    val PROGUARD_GRADLE = PROGUARD
    val WCA_I18N = "0.4.3"

    object Plugins {
        val SHADOW = "5.2.0"
        val NODEJS = "2.2.0"

        val KOTLIN = Versions.KOTLIN

        val KOTLIN_JVM = KOTLIN
        val KOTLIN_MULTIPLATFORM = KOTLIN
    }
}
