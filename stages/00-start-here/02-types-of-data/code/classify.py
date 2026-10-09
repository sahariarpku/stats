def classify(is_label, has_order, is_counted):
    if is_label:
        return "ordinal" if has_order else "nominal"
    return "discrete" if is_counted else "continuous"


variables = [
    ("blood type", True, False, False),
    ("student ID", True, False, False),
    ("grade level", True, True, False),
    ("satisfaction rating", True, True, False),
    ("children in a family", False, False, True),
    ("goals in a match", False, False, True),
    ("height in cm", False, False, False),
    ("temperature in C", False, False, False),
]

for name, is_label, has_order, is_counted in variables:
    print(f"{name:22} -> {classify(is_label, has_order, is_counted)}")

assert classify(True, False, False) == "nominal"
assert classify(True, True, False) == "ordinal"
assert classify(False, False, True) == "discrete"
assert classify(False, False, False) == "continuous"
