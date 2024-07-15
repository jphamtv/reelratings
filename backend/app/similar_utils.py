from difflib import SequenceMatcher

# Compares two titles and returns a similarity ratio
def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()