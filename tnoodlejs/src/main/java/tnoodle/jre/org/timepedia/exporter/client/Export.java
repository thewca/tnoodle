package tnoodle.jre.org.timepedia.exporter.client;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Export {
    String value() default "";

    boolean all() default false;
}
