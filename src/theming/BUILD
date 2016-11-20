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

sass_binary(
    name = "common-style_cssbin",
    src = "common-style.scss",
)

webc_gen_template(
    name = "common-style_templatepack",
    css = ":common-style_cssbin",
    key = "src/theming/common",
    template = "common-style.html",
)

sass_binary(
    name = "global-style_cssbin",
    src = "global-style.scss",
)

webc_gen_template(
    name = "global-style_templatepack",
    css = ":global-style_cssbin",
    key = "src/theming/global",
    template = "global-style.html",
)

webc_gen_template(
    name = "theme-style_templatepack",
    css = ":theme-style_cssbin",
    key = "src/theming/theme",
    template = "theme-style.html",
)