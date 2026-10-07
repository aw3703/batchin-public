import os
import sys

# Add local package to sys.path for direct execution without pip install
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../packages/sdk-python/src")))

from batchin import BatchIn

def main():
    api_key = os.environ.get("BATCHIN_API_KEY")
    if not api_key:
        print("Set BATCHIN_API_KEY before running this example.", file=sys.stderr)
        return 2
    client = BatchIn(api_key=api_key)

    print("BatchIn Python SDK Quickstart Initialized successfully!")
    print(f"Target API: {client.base_url}")
    print("Ready to execute: client.chat.completions.create(...)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
