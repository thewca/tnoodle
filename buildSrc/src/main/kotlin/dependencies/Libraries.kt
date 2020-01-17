package dependencies

object Libraries {
    val GWTEXPORTER = "org.timepedia.exporter:gwtexporter:${Versions.GWTEXPORTER}"
    val MARKDOWNJ_CORE = "org.markdownj:markdownj-core:${Versions.MARKDOWNJ_CORE}"
    val ZIP4J = "net.lingala.zip4j:zip4j:${Versions.ZIP4J}"
    val ITEXTPDF = "com.itextpdf:itextpdf:${Versions.ITEXTPDF}"
    val BATIK_TRANSCODER = "org.apache.xmlgraphics:batik-transcoder:${Versions.BATIK_TRANSCODER}"
    val SNAKEYAML = "org.yaml:snakeyaml:${Versions.SNAKEYAML}"
    val NATIVE_TRAY_ADAPTER = "com.github.taksan:native-tray-adapter:${Versions.NATIVE_TRAY_ADAPTER}"
    val APPLEJAVAEXTENSIONS = "com.apple:AppleJavaExtensions:${Versions.APPLEJAVAEXTENSIONS}"
    val SYSTEM_TRAY = "com.dorkbox:SystemTray:${Versions.SYSTEM_TRAY}"
    val BOUNCYCASTLE = "org.bouncycastle:bcprov-jdk15on:${Versions.BOUNCYCASTLE}"
    val JUNIT_JUPITER_API = "org.junit.jupiter:junit-jupiter-api:${Versions.JUNIT_JUPITER_API}"
    val JUNIT_JUPITER_ENGINE = "org.junit.jupiter:junit-jupiter-engine:${Versions.JUNIT_JUPITER_ENGINE}"
    val KOTLIN_STDLIB_JVM = "org.jetbrains.kotlin:kotlin-stdlib-jdk8:${Versions.KOTLIN_STDLIB_JVM}"
    val KOTLIN_STDLIB_JS = "org.jetbrains.kotlin:kotlin-stdlib-js:${Versions.KOTLIN_STDLIB_JS}"
    val KOTLIN_STDLIB_COMMON = "org.jetbrains.kotlin:kotlin-stdlib-common:${Versions.KOTLIN_STDLIB_COMMON}"
    val KTOR_SERVER_NETTY = "io.ktor:ktor-server-netty:${Versions.KTOR_SERVER_NETTY}"
    val KTOR_SERVER_SERVLET = "io.ktor:ktor-server-servlet:${Versions.KTOR_SERVER_SERVLET}"
    val KTOR_GSON = "io.ktor:ktor-gson:${Versions.KTOR_GSON}"
    val KTOR_SERVER_HOST_COMMON = "io.ktor:ktor-server-host-common:${Versions.KTOR_SERVER_HOST_COMMON}"
    val LOGBACK_CLASSIC = "ch.qos.logback:logback-classic:${Versions.LOGBACK_CLASSIC}"
    val KOTLIN_ARGPARSER = "com.xenomachina:kotlin-argparser:${Versions.KOTLIN_ARGPARSER}"
    val PROGUARD_GRADLE = "net.sf.proguard:proguard-gradle:${Versions.PROGUARD_GRADLE}"
    val WCA_I18N = "com.github.thewca:wca_i18n:${Versions.WCA_I18N}"
    val GOOGLE_APPENGINE_GRADLE = "com.google.cloud.tools:appengine-gradle-plugin:${Versions.GOOGLE_APPENGINE_GRADLE}"
    val GOOGLE_CLOUD_STORAGE = "com.google.cloud:google-cloud-storage:${Versions.GOOGLE_CLOUD_STORAGE}"

    object Buildscript {
        val PROGUARD_GRADLE_ACTUAL = PROGUARD_GRADLE
        val WCA_I18N_ACTUAL = WCA_I18N
        val GOOGLE_APPENGINE_GRADLE_ACTUAL = GOOGLE_APPENGINE_GRADLE
    }
}
