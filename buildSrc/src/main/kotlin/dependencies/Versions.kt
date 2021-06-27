package dependencies

object Versions {
    val JUNIT_JUPITER = "5.7.1"
    val BATIK = "1.14"
    val KOTLIN = "1.5.20"
    val KTOR = "1.6.0"
    val PROGUARD = "7.1.0-beta5"
    val KOTLESS = "0.1.6"

    val MARKDOWNJ_CORE = "0.4"
    val ZIP4J = "2.8.0"
    val ITEXTPDF = "5.5.13.2"
    val BATIK_TRANSCODER = BATIK
    val BATIK_CODEC = BATIK
    val SNAKEYAML = "1.28"
    val SYSTEM_TRAY = "4.1"
    val BOUNCYCASTLE = "1.69"
    val JUNIT_JUPITER_API = JUNIT_JUPITER
    val JUNIT_JUPITER_ENGINE = JUNIT_JUPITER
    val KOTLIN_SERIALIZATION_JSON = "1.2.1"
    val KOTLIN_COROUTINES_CORE = "1.5.0"
    val KTOR_SERVER_NETTY = KTOR
    val KTOR_SERVER_SERVLET = KTOR
    val KTOR_SERIALIZATION = KTOR
    val KTOR_SERVER_HOST_COMMON = KTOR
    val KTOR_WEBSOCKETS = KTOR
    val LOGBACK_CLASSIC = "1.2.3"
    val KOTLIN_ARGPARSER = "2.0.7"
    val PROGUARD_GRADLE = PROGUARD
    val WCA_I18N = "0.4.3"
    val GOOGLE_APPENGINE_GRADLE = "2.4.1"
    val GOOGLE_CLOUD_STORAGE = "1.116.0"
    val TNOODLE_SCRAMBLES = "0.18.0"
    val APACHE_COMMONS_LANG3 = "3.12.0"
    val KOTLESS_KTOR = KOTLESS
    val TESTING_MOCKK = "1.11.0"
    val KOTLINX_ATOMICFU_GRADLE = "0.16.1"

    object Plugins {
        val SHADOW = "7.0.0"
        val NODEJS = "3.1.0"
        val DEPENDENCY_VERSIONS = "0.39.0"

        val KOTLIN = Versions.KOTLIN

        val KOTLIN_JVM = KOTLIN
        val KOTLIN_MULTIPLATFORM = KOTLIN
        val KOTLIN_SERIALIZATION = KOTLIN

        val KOTLESS = Versions.KOTLESS
    }
}
