#!/usr/bin/env python
"""CLI for suggesting the next guide level using Goldilocks band heuristics."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

from sirius_rl.obs.mastery import DEFAULT_RULES, mean_p, recommend_guide_level, update_beta


def parse_attempts(payload: Any) -> Tuple[List[Dict[str, Any]], Any]:
    """Extract attempts and a current level (if present) from an object."""

    attempts: List[Dict[str, Any]] = []
    current_level = None

    if isinstance(payload, dict):
        attempts = payload.get("attempts", [])
        current_level = payload.get("current_level")
        # Allow a single attempt at the top level
        if not attempts and "outcome" in payload:
            attempts = [payload]
    elif isinstance(payload, list):
        attempts = payload

    return attempts, current_level


def load_input(path: Path) -> Tuple[List[Dict[str, Any]], Any]:
    """Load JSON or JSONL input."""

    text = path.read_text(encoding="utf-8")
    try:
        payload = json.loads(text)
        attempts, current_level = parse_attempts(payload)
        return attempts, current_level
    except json.JSONDecodeError:
        attempts: List[Dict[str, Any]] = []
        current_level = None
        for line in text.splitlines():
            if not line.strip():
                continue
            record = json.loads(line)
            record_attempts, record_level = parse_attempts(record)
            attempts.extend(record_attempts)
            if current_level is None and record_level is not None:
                current_level = record_level
        return attempts, current_level


def outcome_to_bool(outcome: Any) -> Any:
    """Normalize an outcome value to a boolean success flag."""

    if isinstance(outcome, str):
        normalized = outcome.strip().lower()
        if normalized in {"pass", "passed", "success"}:
            return True
        if normalized in {"fail", "failed"}:
            return False
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Path to JSON or JSONL log.")
    parser.add_argument("--current-level", type=int, help="Override the current guide level.")
    parser.add_argument("--alpha0", type=float, default=1.0, help="Prior alpha for Beta.")
    parser.add_argument("--beta0", type=float, default=1.0, help="Prior beta for Beta.")
    parser.add_argument(
        "--easier-than",
        type=float,
        default=DEFAULT_RULES["easier_than"],
        help="Threshold below which guidance is increased (easier).",
    )
    parser.add_argument(
        "--harder-than",
        type=float,
        default=DEFAULT_RULES["harder_than"],
        help="Threshold above which guidance is decreased (harder).",
    )
    parser.add_argument(
        "--step",
        type=int,
        default=DEFAULT_RULES["step"],
        help="Amount to adjust the guide level.",
    )
    parser.add_argument("--min-level", type=int, default=None, help="Minimum guide level bound.")
    parser.add_argument("--max-level", type=int, default=None, help="Maximum guide level bound.")

    args = parser.parse_args()

    attempts, level_from_input = load_input(args.input)
    current_level = args.current_level if args.current_level is not None else level_from_input

    if current_level is None:
        raise SystemExit("current_level is required either in the input or via --current-level.")

    alpha, beta = args.alpha0, args.beta0
    for attempt in attempts:
        flag = outcome_to_bool(attempt.get("outcome"))
        if flag is None:
            print(f"Skipping attempt with unknown outcome: {attempt}", file=sys.stderr)
            continue
        alpha, beta = update_beta(alpha, beta, flag)

    p = mean_p(alpha, beta)
    rules = {
        "easier_than": args.easier_than,
        "harder_than": args.harder_than,
        "step": args.step,
        "min_level": args.min_level,
        "max_level": args.max_level,
    }
    next_level = recommend_guide_level(p, current_level, rules)

    output = {
        "alpha": alpha,
        "beta": beta,
        "p": p,
        "current_level": current_level,
        "next_level": next_level,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
