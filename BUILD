package(default_visibility = ["//:internal"])

load("@gs_tools//bazel/ts:defs.bzl", "ts_binary", "ts_library")
load("@gs_tools//bazel/webpack:defs.bzl", "webpack_binary")

package_group(
    name = "internal",
    packages = ["//..."]
)

ts_library(
    name = "lib_js",
    srcs = [],
    deps = [
        "//src/bootstrap",
    ]
)

ts_binary(
    name = "bin_js",
    deps = [":lib_js"],
)
webpack_binary(
    name = "pack_js",
    package = ":bin_js",
    entry = "src/bootstrap/exports.js",
)

filegroup(
    name = "tslint_config",
    srcs = ["tslint.json"]
)

test_suite(
    name = "test",
    tests = [
        "//src/bootstrap:test",
        "//src/button:test",
        "//src/theming:test",
    ]
)

filegroup(
    name = "pack_template",
    srcs = [
        "//src/button:template",
        "//src/theming:template",
        "//src/tool:template",
    ]
)

genrule(
    name = "pack",
    srcs = [
        "@web_animations_js//:next",
        "//:pack_js",
        "//:pack_template",
        "//src/theming:theme-style_templatepack",
    ],
    outs = ["pack.js"],
    cmd = "awk 'FNR==1{print \"\"}1' $(SRCS) > $@",
)
