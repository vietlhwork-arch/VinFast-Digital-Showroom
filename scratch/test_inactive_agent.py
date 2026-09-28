import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from src.services.catalog_service import _CATALOG_CACHE
_CATALOG_CACHE.clear()
from src.agents.nodes.needs_discovery import needs_discovery_node

async def test_comparison():
    state = {
        'messages': [{'role': 'user', 'content': 'So sánh giá, công suất và quãng đường của VF 6 Eco với VF 6 Plus.'}],
        'user_profile': {},
    }
    res = await needs_discovery_node(state)
    print('=== AGENT RESPONSE FOR VF 6 ECO VS PLUS ===')
    print(res.get('response'))

if __name__ == '__main__':
    asyncio.run(test_comparison())
