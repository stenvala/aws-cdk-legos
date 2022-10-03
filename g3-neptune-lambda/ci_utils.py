import subprocess
import sys
import time
import datetime


def enrich_line_with_date(line: str) -> str:
    return (
        f"[{datetime.datetime.utcnow()}] {line}"
        if not line.startswith("[20")
        else line
    )


def enrich_lines_with_date(lines: str) -> str:
    lines = lines.splitlines()
    return "\n".join(
        [enrich_line_with_date(i) for i in lines if i.strip() != ""]
    )


def print_lines(line: str, with_separator=False):
    if with_separator:
        print_lines("".ljust(40, "*"))
    line = enrich_lines_with_date(line)
    if line.strip() != "":
        print(line)


def run_and_yield(cmd, **kwargs):
    process = subprocess.Popen(
        cmd,
        **kwargs,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    for i in iter(process.stdout.readline, b""):
        yield i.decode("utf-8")
    process.stdout.close()
    status = process.wait()
    if status != 0:
        raise Exception(str(status))


def run(cmd, **kwargs):
    start = time.time()
    print_lines(f"$ {cmd}", True)
    try:
        for i in run_and_yield(cmd, **kwargs):
            print_lines(i)
    except Exception as e:
        print_lines(f"COMMAND FAILED WITH STATUS CODE {e}")
        sys.exit(1)
    duration = time.time() - start
    print_lines(f"Duration {duration} s", True)
