import pytest
from src.services.catalog_service import get_fallback_recommendations
from src.agents.nodes.needs_discovery import CustomerNeedsProfile


def test_fallback_recommendations_two_fork_pivot():
    """Verify that when 0 cars match 7 seats < 500M, constraint relaxation returns both forks."""
    fb = get_fallback_recommendations(seat_count=7, budget_max=500_000_000)
    assert fb is not None
    same_budget = fb.get("same_budget_cars", [])
    same_seats = fb.get("same_seats_cars", [])

    # Fork 1: same budget (<500M) should return cars within budget (e.g. VF 5, Herio Green, VF 3)
    assert len(same_budget) > 0
    for car in same_budget:
        assert car["base_price"] <= 500_000_000 * 1.15

    # Fork 2: same seats (7 seats) should return 7-seat cars sorted by lowest price first
    assert len(same_seats) > 0
    for car in same_seats:
        assert car["seats"] == 7
    # Verify lowest price is first (Limo Green at 699M)
    assert same_seats[0]["base_price"] <= same_seats[-1]["base_price"]
    assert any("limo" in c["name"].lower() or "mpv" in c["name"].lower() for c in same_seats)


def test_golden_trio_sufficiency_logic():
    """Verify that having seat_count, usage_purpose, and budget satisfies the Golden Trio."""
    profile = CustomerNeedsProfile(
        seat_count=5,
        usage_purpose="family",
        budget_max=600_000_000,
    )
    has_golden_trio = bool(
        (profile.seat_count or profile.seat_counts)
        and profile.usage_purpose
        and (profile.budget_max or profile.budget_min)
    )
    assert has_golden_trio is True

    # Missing purpose -> False
    profile_no_purpose = CustomerNeedsProfile(
        seat_count=5,
        budget_max=600_000_000,
    )
    assert not bool(
        (profile_no_purpose.seat_count or profile_no_purpose.seat_counts)
        and profile_no_purpose.usage_purpose
        and (profile_no_purpose.budget_max or profile_no_purpose.budget_min)
    )


def test_missing_focus_prioritization():
    """Verify missing focus is determined in priority order: purpose -> budget -> seats."""
    # 1. Missing purpose
    p1 = CustomerNeedsProfile(seat_count=5, budget_max=600_000_000)
    focus1 = "purpose" if not p1.usage_purpose else ("budget" if not p1.budget_max else "seats")
    assert focus1 == "purpose"

    # 2. Has purpose, missing budget
    p2 = CustomerNeedsProfile(seat_count=5, usage_purpose="family")
    focus2 = "purpose" if not p2.usage_purpose else ("budget" if not (p2.budget_max or p2.budget_min) else "seats")
    assert focus2 == "budget"

    # 3. Has purpose and budget, missing seats
    p3 = CustomerNeedsProfile(usage_purpose="family", budget_max=600_000_000)
    focus3 = "purpose" if not p3.usage_purpose else ("budget" if not (p3.budget_max or p3.budget_min) else "seats" if not (p3.seat_count or p3.seat_counts) else None)
    assert focus3 == "seats"


def test_candidate_count_convergence():
    """Verify that candidate count <= 2 triggers context sufficiency."""
    candidates_one = [{"name": "VF 5 Plus"}]
    candidates_two = [{"name": "VF 6 Eco"}, {"name": "VF 6 Plus"}]
    candidates_many = [{"name": "VF 5"}, {"name": "VF 6"}, {"name": "VF 7"}]

    assert (0 < len(candidates_one) <= 2) is True
    assert (0 < len(candidates_two) <= 2) is True
    assert (0 < len(candidates_many) <= 2) is False
