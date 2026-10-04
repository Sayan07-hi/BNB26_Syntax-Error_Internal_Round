import argparse
import statistics
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests


BASE_URL = "http://127.0.0.1:8000/api/v1"


def login(email, password):
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={
            "username": email,
            "password": password,
        },
        timeout=10,
    )

    response.raise_for_status()
    return response.json()["access"]


def submit_entry(email, password, drop_id):
    try:
        # Login
        token = login(email, password)

        # Submit entry
        start = time.perf_counter()

        response = requests.post(
            f"{BASE_URL}/entries/",
            json={
                "drop": drop_id,
            },
            headers={
                "Authorization": f"Bearer {token}",
                "Idempotency-Key": str(uuid.uuid4()),
            },
            timeout=10,
        )

        latency = (time.perf_counter() - start) * 1000

        return {
            "email": email,
            "status": response.status_code,
            "latency": latency,
            "body": response.text[:200],
        }

    except Exception as e:
        return {
            "email": email,
            "status": "ERROR",
            "latency": 0,
            "body": str(e),
        }


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("--drop-id", type=int, required=True)
    parser.add_argument("--concurrency", type=int, default=5)
    parser.add_argument(
        "--users",
        nargs="+",
        required=True,
        help="email:password pairs",
    )

    args = parser.parse_args()

    users = []

    for item in args.users:
        email, password = item.split(":", 1)
        users.append((email, password))

    print("\n======================================")
    print("       FAIRDROP LOAD SIMULATION")
    print("======================================")
    print(f"Drop ID      : {args.drop_id}")
    print(f"Users        : {len(users)}")
    print(f"Concurrency  : {args.concurrency}")
    print("--------------------------------------")

    start = time.perf_counter()

    results = []

    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:

        futures = [
            executor.submit(
                submit_entry,
                email,
                password,
                args.drop_id,
            )
            for email, password in users
        ]

        for future in as_completed(futures):
            result = future.result()
            results.append(result)

            print(
                f"{result['email']:30} "
                f"{result['status']} "
                f"{result['latency']:.2f} ms"
            )

    total_time = time.perf_counter() - start

    successful = [
        r["latency"]
        for r in results
        if isinstance(r["status"], int)
        and 200 <= r["status"] < 300
    ]

    print("--------------------------------------")
    print(f"Total time   : {total_time:.2f} sec")
    print(f"Successful   : {len(successful)}/{len(results)}")

    if successful:
        print(f"Average      : {statistics.mean(successful):.2f} ms")

        if len(successful) > 1:
            print(
                f"P95          : "
                f"{statistics.quantiles(successful, n=20)[18]:.2f} ms"
            )

    print("======================================\n")


if __name__ == "__main__":
    main()