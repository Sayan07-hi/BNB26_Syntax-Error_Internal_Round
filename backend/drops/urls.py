from django.urls import path
from .views import (
    EntryCreateView,
    SimulationRunView,
    CreateDropView,
    ActiveDropView,
    EndRegistrationView,
)


urlpatterns = [
    path(
        "active/",
        ActiveDropView.as_view(),
        name="active-drop",
    ),
    path(
        "entries/",
        EntryCreateView.as_view(),
        name="entry-create",
    ),
    path(
        "active/end-registration/",
        EndRegistrationView.as_view(),
        name="end-active-drop-registration",
    ),
    path(
        "simulation/run/",
        SimulationRunView.as_view(),
        name="simulation-run",
    ),
    path(
        "create/",
        CreateDropView.as_view(),
        name="drop-create",
    ),
]
