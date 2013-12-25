package net.gnehzr.tnoodle.utils;

import net.gnehzr.tnoodle.svglite.Color;
import net.gnehzr.tnoodle.svglite.InvalidHexColorException;

import java.lang.reflect.Type;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

public class GsonUtils {

    private GsonUtils() {}

    // GSON encodes the string "'" as "\u0027" by default.
    // This behavior is controlled by the htmlSafe attribute.
    // We call disableHtmlEscaping to disable this behavior.
    private static GsonBuilder gsonBuilder = new GsonBuilder().disableHtmlEscaping();
    public static Gson GSON = gsonBuilder.create();
    public static synchronized void registerTypeAdapter(Class<?> clz, Object typeAdapter) {
        gsonBuilder = gsonBuilder.registerTypeAdapter(clz, typeAdapter);
        GSON = gsonBuilder.create();
    }
    public static synchronized void registerTypeHierarchyAdapter(Class<?> clz, Object typeAdapter) {
        gsonBuilder = gsonBuilder.registerTypeHierarchyAdapter(clz, typeAdapter);
        GSON = gsonBuilder.create();
    }

    static {
        registerTypeAdapter(Color.class, new Colorizer());
    }

    private static class Colorizer implements JsonSerializer<Color>, JsonDeserializer<Color> {

        @Override
        public JsonElement serialize(Color c, Type t, JsonSerializationContext context) {
            return new JsonPrimitive(c.toHex());
        }

        @Override
        public Color deserialize(JsonElement json, Type t, JsonDeserializationContext context) throws JsonParseException {
            try {
                return new Color(json.getAsString());
            } catch(InvalidHexColorException e) {
                throw new JsonParseException(e);
            }
        }

    }

}
