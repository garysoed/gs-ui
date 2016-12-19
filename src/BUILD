package(default_visibility = ["//:internal"])

load("//:defs.bzl", "gs_ui")
load("@gs_tools//bazel/ts:defs.bzl", "ts_binary", "ts_library")

gs_ui(
    deps = [
      "@gs_tools//src",
      "//src/bootstrap",
      "//src/routing",
    ])

ts_library(
    name = "test_base",
    srcs = [
      "test-base.ts"
    ],
    deps = [
      "@gs_tools//src",
    ])