package dependencies

object Libraries {
    val MARKDOWNJ_CORE = "org.markdownj:markdownj-core:${Versions.MARKDOWNJ_CORE}"
    val ZIP4J = "net.lingala.zip4j:zip4j:${Versions.ZIP4J}"
    val ITEXTPDF = "com.itextpdf:itextpdf:${Versions.ITEXTPDF}"
    val BATIK_TRANSCODER = "org.apache.xmlgraphics:batik-transcoder:${Versions.BATIK_TRANSCODER}"
    val BATIK_CODEC = "org.apache.xmlgraphics:batik-codec:${Versions.BATIK_CODEC}"
    val SNAKEYAML = "org.yaml:snakeyaml:${Versions.SNAKEYAML}"
    val SYSTEM_TRAY = "com.dorkbox:SystemTray:${Versions.SYSTEM_TRAY}"
    val BOUNCYCASTLE = "org.bouncycastle:bcprov-jdk15on:${Versions.BOUNCYCASTLE}"
    val JUNIT_JUPITER_API = "org.junit.jupiter:junit-jupiter-api:${Versions.JUNIT_JUPITER_API}"
    val JUNIT_JUPITER_ENGINE = "org.junit.jupiter:junit-jupiter-engine:${Versions.JUNIT_JUPITER_ENGINE}"
    val KOTLIN_SERIALIZATION_JSON = "org.jetbrains.kotlinx:kotlinx-serialization-json:${Versions.KOTLIN_SERIALIZATION_JSON}"
    val KOTLIN_COROUTINES_CORE = "org.jetbrains.kotlinx:kotlinx-coroutines-core:${Versions.KOTLIN_COROUTINES_CORE}"
    val KTOR_SERVER_NETTY = "io.ktor:ktor-server-netty:${Versions.KTOR_SERVER_NETTY}"
    val KTOR_SERVER_SERVLET = "io.ktor:ktor-server-servlet:${Versions.KTOR_SERVER_SERVLET}"
    val KTOR_SERVER_CONTENT_NEGOTIATION = "io.ktor:ktor-server-content-negotiation:${Versions.KTOR_SERVER_CONTENT_NEGOTIATION}"
    val KTOR_SERVER_HOST_COMMON = "io.ktor:ktor-server-host-common:${Versions.KTOR_SERVER_HOST_COMMON}"
    val KTOR_SERVER_DEFAULT_HEADERS = "io.ktor:ktor-server-default-headers:${Versions.KTOR_SERVER_DEFAULT_HEADERS}"
    val KTOR_SERVER_STATUS_PAGES = "io.ktor:ktor-server-status-pages:${Versions.KTOR_SERVER_STATUS_PAGES}"
    val KTOR_SERVER_CORS = "io.ktor:ktor-server-cors:${Versions.KTOR_SERVER_CORS}"
    val KTOR_SERVER_WEBSOCKETS = "io.ktor:ktor-server-websockets:${Versions.KTOR_SERVER_WEBSOCKETS}"
    val KTOR_SERIALIZATION_KOTLINX_JSON = "io.ktor:ktor-serialization-kotlinx-json:${Versions.KTOR_SERIALIZATION_KOTLINX_JSON}"
    val LOGBACK_CLASSIC = "ch.qos.logback:logback-classic:${Versions.LOGBACK_CLASSIC}"
    val KOTLIN_ARGPARSER = "com.xenomachina:kotlin-argparser:${Versions.KOTLIN_ARGPARSER}"
    val PROGUARD_GRADLE = "com.guardsquare:proguard-gradle:${Versions.PROGUARD_GRADLE}"
    val WCA_I18N = "com.github.thewca:wca_i18n:${Versions.WCA_I18N}"
    val GOOGLE_APPENGINE_GRADLE = "com.google.cloud.tools:appengine-gradle-plugin:${Versions.GOOGLE_APPENGINE_GRADLE}"
    val GOOGLE_CLOUD_STORAGE = "com.google.cloud:google-cloud-storage:${Versions.GOOGLE_CLOUD_STORAGE}"
    val TNOODLE_SCRAMBLES = "org.worldcubeassociation.tnoodle:lib-scrambles:${Versions.TNOODLE_SCRAMBLES}"
    val APACHE_COMMONS_LANG3 = "org.apache.commons:commons-lang3:${Versions.APACHE_COMMONS_LANG3}"
    val KOTLESS_KTOR = "io.kotless:ktor-lang:${Versions.KOTLESS_KTOR}"
    val TESTING_MOCKK = "io.mockk:mockk:${Versions.TESTING_MOCKK}"
    val KOTLINX_ATOMICFU_GRADLE = "org.jetbrains.kotlinx:atomicfu-gradle-plugin:${Versions.KOTLINX_ATOMICFU_GRADLE}"

    object Buildscript {
        val PROGUARD_GRADLE_ACTUAL = PROGUARD_GRADLE
        val WCA_I18N_ACTUAL = WCA_I18N
        val GOOGLE_APPENGINE_GRADLE_ACTUAL = GOOGLE_APPENGINE_GRADLE
        val KOTLINX_ATOMICFU_GRADLE_ACTUAL = KOTLINX_ATOMICFU_GRADLE
    }
}
