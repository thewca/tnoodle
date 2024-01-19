-allowaccessmodification
-dontskipnonpubliclibraryclassmembers

# FIXME...? Routes currently don't work in the browser when code gets obfuscated or optimised
-dontobfuscate
-dontoptimize

-dontnote kotlinx.serialization.AnnotationsKt

# cf. https://github.com/ktorio/ktor-samples/tree/master/other/proguard
-keep class org.worldcubeassociation.tnoodle.server.** { *; }
-keep class org.worldcubeassociation.tnoodle.deployable.jar.** { *; }
-keep class io.ktor.server.netty.Netty { *; }
-keep class io.ktor.server.config.** { *; }
-keep class io.ktor.serialization.** { *; }
-keep class kotlin.reflect.jvm.internal.** { *; }
-keep class kotlin.text.RegexOption { *; }
-keep class io.ktor.serialization.kotlinx.json.KotlinxSerializationJsonExtensionProvider { *; }

# CSS rendering uses reflection black magic, so static bytecode optimisers need a little help
-keep class org.apache.batik.css.parser.** { *; }
-keep class org.apache.batik.dom.** { *; }
-keep class com.itextpdf.text.ImgTemplate { *; }

-keep class ch.qos.logback.core.** { *; }
-keep class ch.qos.logback.classic.** { *; }

-keep class com.sun.jna.** { *; }
-keep class dorkbox.jna.** { *; }
-keep class dorkbox.systemTray.** { *; }
-keep class sun.awt.windows.** { *; }
-keep class sun.lwawt.macosx.** { *; }
-keep class sun.awt.X11.** { *; }
-keep class sun.awt.SunToolkit { *; }

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

-keepclasseswithmembernames class * {
    native <methods>;
}

-keepclasseswithmembernames enum * {
    <fields>;
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-dontwarn
