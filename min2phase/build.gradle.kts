plugins {
    `java-library`
}

description = "Chen Shuang's (https://github.com/ChenShuang) awesome 3x3 scrambler built on top of Herbert Kociemba's Java library."

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}
