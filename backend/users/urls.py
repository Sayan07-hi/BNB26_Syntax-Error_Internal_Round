from django.urls import path

from .views import EmailTokenObtainPairView, RegisterView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="token-obtain-pair"),
]
