# Generated by Django 3.2.14 on 2023-01-04 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ndrppcwp_app', '0010_auto_20230104_2049'),
    ]

    operations = [
        migrations.AlterField(
            model_name='author',
            name='educational_prefixes',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='author',
            name='m_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='author',
            name='s_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
