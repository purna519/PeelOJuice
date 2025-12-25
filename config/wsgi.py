"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Run migrations and create superuser on startup (for Railway deployment)
if os.environ.get('RAILWAY_ENVIRONMENT'):
    import django
    django.setup()
    from django.core.management import call_command
    print("Running migrations...")
    call_command('migrate', '--noinput')
    print("Creating default superuser...")
    call_command('create_default_superuser')
    print("Collecting static files...")
    call_command('collectstatic', '--noinput')

application = get_wsgi_application()
