# Generated by Django 3.2.14 on 2023-03-09 12:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ndrppcwp_app', '0022_auto_20230309_1208'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reporterror',
            name='email',
            field=models.EmailField(max_length=50),
        ),
    ]
