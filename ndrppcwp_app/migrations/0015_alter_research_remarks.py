# Generated by Django 3.2.14 on 2023-03-08 13:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ndrppcwp_app', '0014_auto_20230308_2057'),
    ]

    operations = [
        migrations.AlterField(
            model_name='research',
            name='remarks',
            field=models.TextField(blank=True, null=True),
        ),
    ]
