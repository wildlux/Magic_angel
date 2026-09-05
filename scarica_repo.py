#!/usr/bin/env python3
"""Scarica automaticamente il repository Magic_angel da GitHub."""

import argparse
import os
import shutil
import subprocess
import sys

REPO_URL = "git@github.com:wildlux/Magic_angel.git"
DEFAULT_DEST = "Magic_angel"


def run(cmd):
    print(f"> {' '.join(cmd)}")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        sys.exit(f"Errore durante l'esecuzione: {' '.join(cmd)}")


def main():
    parser = argparse.ArgumentParser(description="Scarica il repository Magic_angel da GitHub.")
    parser.add_argument(
        "-d", "--dest",
        default=DEFAULT_DEST,
        help=f"Cartella di destinazione (default: {DEFAULT_DEST})",
    )
    parser.add_argument(
        "--https",
        action="store_true",
        help="Usa HTTPS invece di SSH",
    )
    parser.add_argument(
        "--depth",
        type=int,
        default=None,
        help="Clone parziale (solo gli ultimi N commit)",
    )
    args = parser.parse_args()

    if not shutil.which("git"):
        sys.exit("git non è installato sul sistema.")

    url = "https://github.com/wildlux/Magic_angel.git" if args.https else REPO_URL

    if os.path.exists(args.dest):
        sys.exit(
            f"La cartella '{args.dest}' esiste già. "
            "Rimuovila o scegli un'altra destinazione con -d."
        )

    cmd = ["git", "clone", url, args.dest]
    if args.depth:
        cmd.extend(["--depth", str(args.depth)])

    run(cmd)
    print(f"\nRepository scaricato con successo in '{args.dest}'.")


if __name__ == "__main__":
    main()
