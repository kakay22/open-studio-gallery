from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='Painting',
            fields=[
                ('id', models.CharField(max_length=64, primary_key=True, serialize=False)),
                ('asset', models.CharField(max_length=40)),
                ('title', models.CharField(blank=True, max_length=60)),
                ('artist', models.CharField(blank=True, max_length=40)),
                ('w', models.FloatField(default=1)),
                ('h', models.FloatField(default=1)),
                ('owner', models.CharField(blank=True, max_length=40)),
                ('created', models.BigIntegerField()),
            ],
        ),
    ]
