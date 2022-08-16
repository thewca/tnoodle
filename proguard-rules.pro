-allowaccessmodification

# KTOR
# cf. https://github.com/ktorio/ktor-samples/blob/main/proguard/build.gradle
-dontobfuscate
-dontoptimize

-keep class org.worldcubeassociation.tnoodle.server.** { *; }
-keep class io.ktor.server.netty.Netty { *; }
-keep class kotlin.reflect.jvm.internal.** { *; }
-keep class kotlin.text.RegexOption { *; }

# Logging
-keep class ch.qos.logback.core.** { *; }

# SystenTray
-keep class com.sun.jna.** { *; }
-keep class dorkbox.jna.** { *; }
-keep class dorkbox.systemTray.** { *; }
-keep class sun.awt.windows.** { *; }
-keep class sun.lwawt.macosx.** { *; }
-keep class sun.awt.X11.** { *; }
-keep class sun.awt.SunToolkit { *; }

# KotlinX serialization
-dontnote kotlinx.serialization.AnnotationsKt

-keep,includedescriptorclasses class kotlinx.serialization.json.**$$serializer { *; }
-keep,includedescriptorclasses class org.worldcubeassociation.tnoodle.**$$serializer { *; }

-keepattributes *Annotation*
-keepattributes InnerClasses

-keepclasseswithmembers class org.worldcubeassociation.tnoodle.** {
    kotlinx.serialization.KSerializer serializer(...);
}

-keepclassmembers class org.worldcubeassociation.tnoodle.** {
    *** Companion;
}

# various optimisations
-keepclasseswithmembernames class * {
    native <methods>;
}

-keepclasseswithmembernames enum * {
    <fields>;
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-dontwarn
