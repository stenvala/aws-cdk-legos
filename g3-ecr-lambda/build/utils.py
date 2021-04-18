import pathlib
import shutil
import json
from glob import glob
import hashlib
import os
import subprocess
import argparse


# https://stackoverflow.com/questions/24937495/how-can-i-calculate-a-hash-for-a-filesystem-directory-using-python


def get_hash(directory):
    sha_hash = hashlib.md5()
    if not os.path.exists(directory):
        return -1

    try:
        for root, dirs, files in os.walk(directory):
            for names in files:
                filepath = os.path.join(root, names)
                try:
                    f1 = open(filepath, 'rb')
                except:
                    f1.close()
                    continue

                while 1:
                    buf = f1.read(4096)
                    if not buf:
                        break
                    sha_hash.update(hashlib.md5(
                        buf).hexdigest().encode('utf-8'))
                f1.close()

    except:
        import traceback
        # Print the stack traceback
        traceback.print_exc()
        return -2

    return sha_hash.hexdigest()


def run_command(command):
    # command = command.split(' ')
    p = subprocess.Popen(command,
                         shell=True,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT)
    return iter(p.stdout.readline, b'')
