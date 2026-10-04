from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction


class Command(BaseCommand):
    help = "Ensure sim01@test.com through sim25@test.com exist as active non-staff users."

    def handle(self, *args, **options):
        User = get_user_model()
        created = 0
        for number in range(1, 26):
            email = f"sim{number:02d}@test.com"
            user = User.objects.filter(email__iexact=email).first()
            if user:
                if not user.is_active or user.is_staff:
                    raise CommandError(f"{email} exists but is not an active simulation user.")
                continue
            try:
                with transaction.atomic():
                    user = User(username=email, email=email, is_active=True, is_staff=False)
                    user.set_unusable_password()
                    user.save()
            except IntegrityError as error:
                raise CommandError(f"Could not create {email}; its username may already exist.") from error
            created += 1
        self.stdout.write(self.style.SUCCESS(f"Simulation accounts ready: 25 total, {created} created."))
