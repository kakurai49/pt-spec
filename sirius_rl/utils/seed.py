"""Randomness helpers for deterministic experiments."""

from __future__ import annotations

from typing import Optional

import random


def create_rng(seed: Optional[int] = None) -> random.Random:
    """Create a Python ``random.Random`` instance for reproducibility."""

    rng = random.Random()
    rng.seed(seed)
    return rng
