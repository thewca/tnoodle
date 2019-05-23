package org.worldcubeassociation.tnoodle.utils

class Plugins<H>(packageName: String, pluginClass: Class<H>, classLoader: ClassLoader?) {
    private val filePlugins: Map<String, H>
    private val pluginComment: Map<String, String>

    val plugins: Map<String, H>
        get() = filePlugins.toMap()

    init {
        val useClassLoader = classLoader ?: javaClass.classLoader

        val packagePath = packageName.replace(".", "/")
        val pluginName = packageName.split(".").last()

        val pluginDefinitionsFilename = packagePath + "/" + pluginName + "s"
        val resInput = useClassLoader.getResourceAsStream(pluginDefinitionsFilename)!!

        val newFilePlugins = mutableMapOf<String, H>()
        val newPluginComment = mutableMapOf<String, String>()

        var lastComment: String? = null

        for (ln in resInput.bufferedReader().lineSequence()) {
            val line = ln.trim()

            // lines starting with # and empty lines are ignored
            if (line.isEmpty()) {
                lastComment = null
                continue
            }

            if (line.startsWith("#")) {
                lastComment = line.substring(1)
                continue
            }

            val (name, definition) = line.split("\\s+".toRegex(), 2)

            val lazyClass = LazyInstantiator<H>(definition, pluginClass, useClassLoader)

            // Note that we may be clobbering something already in newFilePlugins,
            // this is ok. Consider a project B that uses project A,
            // this way, project B can clobber project A's settings.
            newFilePlugins[name] = lazyClass
            newPluginComment[name] = lastComment ?: name

            lastComment = null
        }

        filePlugins = newFilePlugins
        pluginComment = newPluginComment
    }

    fun getPluginComment(key: String) = pluginComment[key]
}
