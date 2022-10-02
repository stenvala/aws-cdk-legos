import os


print("Starting")
print(
    "Environment variable MY_INPUT_1 has value",
    os.environ.get("MY_INPUT_1", "not-defined"),
)
