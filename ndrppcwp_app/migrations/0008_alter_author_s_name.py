# Generated by Django 3.2.14 on 2022-12-03 06:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ndrppcwp_app', '0007_research_publication_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='author',
            name='s_name',
            field=models.CharField(blank=True, default='', max_length=255, null=True, unique=True),
        ),
    ]
