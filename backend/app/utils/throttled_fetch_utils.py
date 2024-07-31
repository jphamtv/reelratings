import asyncio
import logging
import random


async def throttled_fetch(fetch_func, items, target_duration=300, max_concurrent=3):
    semaphore = asyncio.Semaphore(max_concurrent)
    total_items = len(items)
    average_delay = (target_duration / total_items) * max_concurrent

    async def fetch_with_throttle(item, item_index):
        async with semaphore:
            delay = random.uniform(average_delay * 0.5, average_delay * 1.5)
            await asyncio.sleep(delay)
            start_time = asyncio.get_event_loop().time()
            try:
                result = await fetch_func(item)
                end_time = asyncio.get_event_loop().time()
                logging.info(
                    f"Processed item {item_index + 1}/{total_items} in {end_time - start_time:.2f} seconds"
                )
                return result
            except Exception as e:
                logging.error(
                    f"Error processing item {item_index + 1}/{total_items} - {item}: {type(e).__name__}: {str(e)}."
                )
                return None

    results = await asyncio.gather(
        *(fetch_with_throttle(item, i) for i, item in enumerate(items))
    )
    return [result for result in results if result is not None]
