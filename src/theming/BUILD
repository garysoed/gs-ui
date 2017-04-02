package(default_visibility = ["//:internal"])
load("@gs_tools//bazel/webc:defs.bzl", "webc_gen_template")

load("//:defs.bzl", "gs_ui")

gs_ui(
    deps = [
      "@gs_tools//src",
      "//src/const"
    ])

native.filegroup(
    name = "common-style_cssbin",
    srcs = ["common-style.css"],
)

webc_gen_template(
    name = "common-style_templatepack",
    css = ":common-style_cssbin",
    key = "src/theming/common",
    template = "common-style.html",
)

native.filegroup(
    name = "global-style_cssbin",
    srcs = ["global-style.css"],
)

webc_gen_template(
    name = "global-style_templatepack",
    css = ":global-style_cssbin",
    key = "src/theming/global",
    template = "global-style.html",
)
