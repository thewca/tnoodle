package dependencies

object Versions {
    val JUNIT_JUPITER = "5.8.2"
    val BATIK = "1.14"
    val KOTLIN = "1.6.10"
    val KTOR = "1.6.1"
    val PROGUARD = "7.2.0"
    val KOTLESS = "0.1.6"

    val MARKDOWNJ_CORE = "0.4"
    val ZIP4J = "2.9.1"
    val ITEXTPDF = "5.5.13.2"
    val BATIK_TRANSCODER = BATIK
    val BATIK_CODEC = BATIK
    val SNAKEYAML = "1.30"
    val SYSTEM_TRAY = "4.1"
    val BOUNCYCASTLE = "1.70"
    val JUNIT_JUPITER_API = JUNIT_JUPITER
    val JUNIT_JUPITER_ENGINE = JUNIT_JUPITER
    val KOTLIN_SERIALIZATION_JSON = "1.3.2"
    val KOTLIN_COROUTINES_CORE = "1.6.0"
    val KTOR_SERVER_NETTY = KTOR
    val KTOR_SERVER_SERVLET = KTOR
    val KTOR_SERIALIZATION = KTOR
    val KTOR_SERVER_HOST_COMMON = KTOR
    val KTOR_WEBSOCKETS = KTOR
    val LOGBACK_CLASSIC = "1.2.10"
    val KOTLIN_ARGPARSER = "2.0.7"
    val PROGUARD_GRADLE = PROGUARD
    val WCA_I18N = "0.4.3"
    val GOOGLE_APPENGINE_GRADLE = "2.4.2"
    val GOOGLE_CLOUD_STORAGE = "2.4.1"
    val TNOODLE_SCRAMBLES = "0.18.1"
    val APACHE_COMMONS_LANG3 = "3.12.0"
    val KOTLESS_KTOR = KOTLESS
    val TESTING_MOCKK = "1.12.2"
    val KOTLINX_ATOMICFU_GRADLE = "0.17.1"

    object Plugins {
        val SHADOW = "7.1.2"
        val NODEJS = "3.2.0"
        val DEPENDENCY_VERSIONS = "0.42.0"

        val KOTLIN = Versions.KOTLIN

        val KOTLIN_JVM = KOTLIN
        val KOTLIN_MULTIPLATFORM = KOTLIN
        val KOTLIN_SERIALIZATION = KOTLIN

        val KOTLESS = Versions.KOTLESS
    }
}
