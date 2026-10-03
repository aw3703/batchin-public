"""
Agent Resilience: Hedged Dual-Dispatch
Provides an opt-in client-side backup request policy. It does not guarantee a latency improvement and should be used only when duplicate upstream work is acceptable.
"""
from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Optional
from batchin.client import AsyncBatchIn


class HedgedDualDispatch:
    def __init__(self, client: AsyncBatchIn, hedge_delay_ms: int = 350) -> None:
        self.client = client
        self.hedge_delay = hedge_delay_ms / 1000.0

    async def execute(
        self,
        primary_model: str,
        backup_model: str,
        messages: List[Dict[str, Any]],
        **kwargs: Any,
    ) -> Dict[str, Any]:
        loop = asyncio.get_running_loop()
        finished_future: asyncio.Future[Dict[str, Any]] = loop.create_future()

        async def run_req(model_name: str) -> None:
            try:
                res = await self.client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    **kwargs,
                )
                if not finished_future.done():
                    finished_future.set_result(res)
            except Exception as exc:
                if not finished_future.done():
                    # If this was primary and backup hasn't resolved, let backup try
                    pass

        task_primary = asyncio.create_task(run_req(primary_model))

        async def schedule_backup() -> None:
            await asyncio.sleep(self.hedge_delay)
            if not finished_future.done():
                await run_req(backup_model)

        task_backup_scheduler = asyncio.create_task(schedule_backup())

        try:
            # Wait for first completion or failure
            result = await finished_future
            return result
        finally:
            task_primary.cancel()
            task_backup_scheduler.cancel()
