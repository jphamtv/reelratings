import math


def format_runtime(runtime):
    """Format media runtime minutes to hours format for readability"""
    if runtime is None or not isinstance(runtime, (int, float)):
        return None

    num_of_hours = runtime / 60
    hours = math.floor(num_of_hours)
    minutes = runtime - (hours * 60)

    if hours > 0:
        return f"{hours}h {minutes}m"
    else:
        return f"{minutes}m"
