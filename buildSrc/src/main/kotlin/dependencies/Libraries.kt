package dependencies

object Libraries {
    val GWTEXPORTER = "org.timepedia.exporter:gwtexporter:${Versions.GWTEXPORTER}"
    val GSON = "com.google.code.gson:gson:${Versions.GSON}"
    val JOPT_SIMPLE = "net.sf.jopt-simple:jopt-simple:${Versions.JOPT_SIMPLE}"
    val MARKDOWNJ_CORE = "org.markdownj:markdownj-core:${Versions.MARKDOWNJ_CORE}"
    val JAVAX_SERVLET_API = "javax.servlet:javax.servlet-api:${Versions.JAVAX_SERVLET_API}"
    val JODA_TIME = "joda-time:joda-time:${Versions.JODA_TIME}"
    val ZIP4J = "net.lingala.zip4j:zip4j:${Versions.ZIP4J}"
    val ITEXTPDF = "com.itextpdf:itextpdf:${Versions.ITEXTPDF}"
    val BATIK_TRANSCODER = "org.apache.xmlgraphics:batik-transcoder:${Versions.BATIK_TRANSCODER}"
    val SNAKEYAML = "org.yaml:snakeyaml:${Versions.SNAKEYAML}"
    val WINSTONE = "net.sourceforge.winstone:winstone:${Versions.WINSTONE}"
    val NATIVE_TRAY_ADAPTER = "com.github.taksan:native-tray-adapter:${Versions.NATIVE_TRAY_ADAPTER}"
    val APPLEJAVAEXTENSIONS = "com.apple:AppleJavaExtensions:${Versions.APPLEJAVAEXTENSIONS}"
    val URLREWRITEFILTER = "org.tuckey:urlrewritefilter:${Versions.URLREWRITEFILTER}"
    val BOUNCYCASTLE = "org.bouncycastle:bcprov-jdk15on:${Versions.BOUNCYCASTLE}"
    val JUNIT_JUPITER_API = "org.junit.jupiter:junit-jupiter-api:${Versions.JUNIT_JUPITER_API}"
    val JUNIT_JUPITER_ENGINE = "org.junit.jupiter:junit-jupiter-engine:${Versions.JUNIT_JUPITER_ENGINE}"
    val ANDROID_APPCOMPAT_V7 = "com.android.support:appcompat-v7:${Versions.ANDROID_APPCOMPAT_V7}"
    val ANDROID_SUPPORT_V4 = "com.android.support:support-v4:${Versions.ANDROID_SUPPORT_V4}"
    val ANDROIDSVG = "com.caverock:androidsvg:${Versions.ANDROIDSVG}"

    val ANDROID_BUILD_TOOLS = "com.android.tools.build:gradle:${Versions.ANDROID_BUILD_TOOLS}"

    object Buildscript {
        val ANDROID_BUILD_TOOLS_ACTUAL = ANDROID_BUILD_TOOLS
    }
}
