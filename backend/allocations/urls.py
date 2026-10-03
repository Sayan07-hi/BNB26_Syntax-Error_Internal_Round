from django.urls import path
from .views import AllocationCreateView


urlpatterns = [
    path("", AllocationCreateView.as_view(), name="allocation-create"),
]