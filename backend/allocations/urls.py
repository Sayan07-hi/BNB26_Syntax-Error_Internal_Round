from django.urls import path
from .views import (
    AllocationCreateView,
    FairAllocationView,
    AllocationMetricsView,
)


urlpatterns = [
    path(
        "",
        AllocationCreateView.as_view(),
        name="allocation-create",
    ),
    path(
        "fair/<int:drop_id>/",
        FairAllocationView.as_view(),
        name="fair-allocation",
    ),
    path(
    "metrics/<int:drop_id>/",
    AllocationMetricsView.as_view(),
    name="allocation-metrics",
),
]