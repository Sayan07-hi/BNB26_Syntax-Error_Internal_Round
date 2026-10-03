from django.urls import path
from .views import (
    AllocationCreateView,
    FairAllocationView,
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
]