# Generated by Django 3.2.14 on 2022-12-02 10:32

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('ndrppcwp_app', '0003_alter_research_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='Author',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('slug', models.SlugField(max_length=255, unique=True)),
                ('s_name', models.CharField(blank=True, max_length=255, null=True)),
                ('f_name', models.CharField(max_length=255)),
                ('m_name', models.CharField(blank=True, max_length=255, null=True)),
                ('l_name', models.CharField(max_length=255)),
                ('educational_prefixes', models.CharField(blank=True, max_length=255, null=True)),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ('date_created',),
            },
        ),
        migrations.AddField(
            model_name='research',
            name='URL',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='research',
            name='source_document',
            field=models.CharField(choices=[('Sylvatrop Technical Journal of the Philippine Ecosystems', 'Sylvatrop Technical Journal of the Philippine Ecosystems'), ('Natural Resources Volume 27 Nos. 1 and 2', 'Natural Resources Volume 27 Nos. 1 and 2'), ('Herdin', 'Herdin'), ('PCIEERD', 'PCIEERD')], default='Sylvatrop Technical Journal of the Philippine Ecosystems', max_length=255),
        ),
        migrations.RemoveField(
            model_name='research',
            name='author',
        ),
        migrations.AddField(
            model_name='research',
            name='author',
            field=models.ManyToManyField(related_name='fk_author_research', to='ndrppcwp_app.Author'),
        ),
    ]
