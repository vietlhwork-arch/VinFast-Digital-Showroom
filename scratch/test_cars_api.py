import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(follow_redirects=True) as client:
        r = await client.get("http://localhost:8000/api/cars/")
        print("GET /api/cars/ Status:", r.status_code)
        if r.status_code == 200:
            cars = r.json()
            print("First car JSON keys:", list(cars[0].keys()))
            c = cars[0]
            print(f"=== {c.get('model_name')} ===")
            print(f"  range_km: {c.get('range_km')}")
            print(f"  maximum_power_kw: {c.get('maximum_power_kw')}")
            print(f"  maximum_torque_nm: {c.get('maximum_torque_nm')}")
            print(f"  usable_battery_capacity: {c.get('usable_battery_capacity')}")
            print(f"  seat_count: {c.get('seat_count')}")
            print(f"  length_mm: {c.get('length_mm')}")
            print(f"  width_mm: {c.get('width_mm')}")
            print(f"  height_mm: {c.get('height_mm')}")
            print(f"  wheelbase_mm: {c.get('wheelbase_mm')}")

if __name__ == "__main__":
    asyncio.run(main())
