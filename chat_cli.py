"""Interactive Terminal Chat CLI for testing VinFast AI Advisor Agent without Frontend."""

import asyncio
import sys

# Ensure UTF-8 printing in Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv

load_dotenv()

from src.agents.graph import agent


async def main():
    print("=" * 70)
    print("🤖 CHÀO MỪNG BẠN ĐẾN VỚI VINFAST AI SALES ADVISOR (TERMINAL CLI CHAT)")
    print("Gõ 'exit' hoặc 'quit' để thoát cuộc đàm thoại.")
    print("=" * 70)

    state = {
        "messages": [],
        "user_profile": {},
        "current_stage": "GUARDRAIL",
    }

    while True:
        try:
            user_input = input("\n👤 Khách hàng: ").strip()
            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit"]:
                print("👋 Cảm ơn bạn đã trải nghiệm VinFast AI Advisor!")
                break

            state["query"] = user_input
            if "messages" not in state:
                state["messages"] = []
            state["messages"].append({"role": "user", "content": user_input})

            print("\n🤖 AI Advisor đang xử lý...")
            result = await agent.ainvoke(state)

            # Update conversation state
            state["current_stage"] = result.get("current_stage", state["current_stage"])
            if "user_profile" in result and result["user_profile"]:
                state["user_profile"] = result["user_profile"]

            response_text = result.get("response") or "Dạ em đã ghi nhận thông tin."
            state["messages"].append({"role": "assistant", "content": response_text})

            print(f"\n🤖 AI Advisor [{result.get('current_stage', 'CHAT')}]:")
            print("-" * 50)
            print(response_text)
            print("-" * 50)

        except KeyboardInterrupt:
            print("\n👋 Đã thoát đàm thoại.")
            break
        except Exception as e:
            print(f"\n❌ Lỗi xử lý: {e}")


if __name__ == "__main__":
    asyncio.run(main())
