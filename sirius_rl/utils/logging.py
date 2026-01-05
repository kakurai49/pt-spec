"""Lightweight JSONL logger for RL training and evaluation."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional


@dataclass
class JsonlLogger:
    """Append-only JSON Lines logger with a fixed schema."""

    path: Path
    run_id: Optional[str] = None
    _mandatory_fields: tuple[str, ...] = field(
        default=("run_id", "seed", "t", "episode", "reward", "info"),
        init=False,
    )

    def __post_init__(self) -> None:
        self.path = Path(self.path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def log(
        self,
        *,
        seed: Optional[int],
        t: int,
        episode: int,
        reward: float,
        info: Dict[str, Any],
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Write a single event to the JSONL file."""

        record: Dict[str, Any] = {
            "run_id": self.run_id,
            "seed": seed,
            "t": t,
            "episode": episode,
            "reward": float(reward),
            "info": info,
        }
        if extra:
            record.update(extra)

        missing = [field for field in self._mandatory_fields if field not in record]
        if missing:
            raise ValueError(f"Missing required log fields: {missing}")

        with self.path.open("a", encoding="utf-8") as fp:
            fp.write(json.dumps(record, ensure_ascii=False) + "\n")
