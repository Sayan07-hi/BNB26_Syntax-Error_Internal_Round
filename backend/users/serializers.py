from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        max_length=150,
        error_messages={
            "required": "Email address is required.",
            "invalid": "Enter a valid email address.",
        }
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password"]

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(
            Q(email__iexact=email) | Q(username__iexact=email)
        ).exists():
            raise serializers.ValidationError(
                "An account with this email address already exists."
            )
        return email

    def create(self, validated_data):
        email = validated_data["email"]
        return User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
        )


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Keep SimpleJWT's username request key, with email-only validation."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["is_staff"] = user.is_staff
        return token

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"] = serializers.EmailField(
            write_only=True,
            error_messages={
                "required": "Email address is required.",
                "invalid": "Enter a valid email address.",
            },
        )

    def validate(self, attrs):
        email = attrs["username"].strip()
        user = User.objects.filter(email__iexact=email).only("username").first()
        attrs["username"] = user.username if user else email.lower()
        try:
            return super().validate(attrs)
        except AuthenticationFailed as error:
            raise AuthenticationFailed(
                "Email address or password is incorrect."
            ) from error
