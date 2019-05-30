package org.worldcubeassociation.tnoodle.server.util

import com.google.gson.Gson
import com.google.gson.GsonBuilder

object GsonUtil {
    private val GSON_BUILDER by lazy {
        GsonBuilder().apply { configureLoaded() }
    }

    val GSON: Gson
        get() = GSON_BUILDER.create()

    private val BUILDER_CONFIGS = mutableListOf<(GsonBuilder) -> Unit>()

    fun registerBuilderConfig(config: GsonBuilder.() -> Unit) {
        BUILDER_CONFIGS.add(config)
    }

    fun GsonBuilder.configureLoaded() {
        for (cfg in BUILDER_CONFIGS) {
            cfg(this)
        }

        for ((cls, adapter) in TYPE_ADAPTERS) {
            registerTypeAdapter(cls, adapter)
        }

        for ((cls, hierarchyAdapter) in TYPE_HIERARCHY_ADAPTERS) {
            registerTypeHierarchyAdapter(cls, hierarchyAdapter)
        }
    }

    private val TYPE_ADAPTERS = mutableListOf<Pair<Class<*>, Any>>()
    private val TYPE_HIERARCHY_ADAPTERS = mutableListOf<Pair<Class<*>, Any>>()

    fun registerTypeAdapter(clz: Class<*>, typeAdapter: Any) {
        TYPE_ADAPTERS.add(clz to typeAdapter)
    }

    fun registerTypeHierarchyAdapter(clz: Class<*>, typeAdapter: Any) {
        TYPE_HIERARCHY_ADAPTERS.add(clz to typeAdapter)
    }

    init {
        registerBuilderConfig {
            disableHtmlEscaping()
        }
    }
}
