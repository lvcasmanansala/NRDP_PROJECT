# Generated by Django 3.2.14 on 2022-12-02 10:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ndrppcwp_app', '0004_auto_20221202_1832'),
    ]

    operations = [
        migrations.AddField(
            model_name='research',
            name='text_availability',
            field=models.CharField(choices=[('Abstract', 'Abstract'), ('Full-Text', 'Full-Text')], default='Abstract', max_length=255),
        ),
        migrations.AlterField(
            model_name='research',
            name='source_document',
            field=models.CharField(choices=[('Sylvatrop Technical Journal of the Philippine Ecosystems', 'Sylvatrop Technical Journal of the Philippine Ecosystems'), ('Natural Resources Volume 27 Nos. 1 and 2', 'Natural Resources Volume 27 Nos. 1 and 2'), ('Herdin', 'Herdin'), ('PCIEERD', 'PCIEERD'), ('ResearchGate', 'ResearchGate')], default='Sylvatrop Technical Journal of the Philippine Ecosystems', max_length=255),
        ),
    ]
