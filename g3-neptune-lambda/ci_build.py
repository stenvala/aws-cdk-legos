import json
from pathlib import Path
import os
import stat
from ci_utils import run, print_lines
import argparse
import time
import shutil
import glob
import sys
from datetime import datetime

START = time.time()

ROOT = Path(__file__).parent.absolute()
BUILD_TARGET = ROOT / "output"


def create_build_target():
    if os.path.isdir(BUILD_TARGET):
        shutil.rmtree(BUILD_TARGET, ignore_errors=True)
    Path(BUILD_TARGET).mkdir(parents=True, exist_ok=True)


def build_lambda():
    print_lines("Building lambda", True)
    api_src = ROOT / "src" / "api"
    api_target = BUILD_TARGET / "api"
    shutil.copytree(api_src, api_target / "api")
    shutil.copyfile(ROOT / "src" / "aws_api.py", api_target / "main.py")
    run(
        f"pip install -r {api_target / 'api'}/requirements.txt -t .",
        cwd=api_target,
    )

    to_remove = ["__pycache__", ".pytest_cache"]
    os.chmod(api_target, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)
    for i in to_remove:
        shutil.rmtree(f"{api_target}/{i}", ignore_errors=True)
    for file in glob.glob(f"{api_target}/*.dist-info", recursive=True):
        shutil.rmtree(file)
    for file in glob.glob(f"{api_target}/**/__pycache__", recursive=True):
        shutil.rmtree(file)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--docker", action="store_true")
    args = ap.parse_args()
    create_build_target()
    build_lambda()
    ##
    # run(f"du -sh {BUILD_TARGET}/*", cwd=ROOT)
    print_lines("Build ready", True)
    duration = time.time() - START
    print_lines(f"Total duration {duration}")
