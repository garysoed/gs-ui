workspace(name = "gs_ui")


local_repository(
    name = "gs_tools",
    path = "./node_modules/gs-tools",
)

new_local_repository(
    name = "karma",
    path = "./node_modules/karma",
    build_file = "node_modules/gs-tools/bazel/karma/karma.BUILD",
)

new_local_repository(
    name = "tslint",
    path = "./node_modules/tslint",
    build_file = "node_modules/gs-tools/bazel/tslint/tslint.BUILD",
)

new_local_repository(
    name = "typescript",
    path = "./node_modules/typescript",
    build_file = "node_modules/gs-tools/bazel/typescript/typescript.BUILD",
)

# Web Animations Polyfill
new_local_repository(
    name = "web_animations_js",
    path = "./node_modules/web-animations-js",
    build_file = "web_animations_js.BUILD",
)

new_local_repository(
    name = "webpack",
    path = "./node_modules/webpack",
    build_file = "node_modules/gs-tools/bazel/webpack/webpack.BUILD",
)
