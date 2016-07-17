package(default_visibility = ["//:internal"])
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")
load("@gs_tools//bazel/webc:defs.bzl", "webc_gen_template")

load("//:defs.bzl", "gs_ui")

gs_ui(
    deps = [
      "@gs_tools//src"
    ])

sass_binary(
    name = "theme-style_cssbin",
    src = "theme-style.scss",
)


webc_gen_template(
    name = "theme-style_templatepack",
    css = ":theme-style_cssbin",
    key = "src/theming/theme",
    template = "theme-style.html",
)