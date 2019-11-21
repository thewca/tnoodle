package configurations

import org.gradle.api.Project
import org.gradle.api.publish.PublishingExtension
import org.gradle.api.publish.maven.MavenPublication
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.create
import org.gradle.kotlin.dsl.get

object Publications {
    fun Project.configureMavenPublication(targetArtifactId: String? = null) {
        configure<PublishingExtension> {
            publications {
                create<MavenPublication>("tnoodle") {
                    targetArtifactId?.let {
                        artifactId = it
                    }

                    from(components["java"])
                }
            }
        }
    }
}
