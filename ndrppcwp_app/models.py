 
from django.db import models
from django.db.models import Q
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db.models.base import Model
from django.utils.text import slugify
from django.urls import reverse
from django.utils.timezone import make_aware, now 
from .helpers.file_validators import file_validator_valid_pdf_image
import os, uuid, shortuuid

class Author(models.Model):

    PREFIXES_LIST = (
        ('Mr','Mr'),
        ('Ms','Ms'),
        ('Mrs','Mrs'),
        ('Mx','Mx'),
        ('Dr','Dr'),
        ('Engr','Engr'),
        ('Chan','Chan'),
        ('Miss','Miss'),
        ('Pres','Pres'),
        ('Prof','Prof'),
        ('Rep','Rep'),
        ('The Hon','The Hon'),

    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    slug = models.SlugField(max_length=255, unique=True, null=True)
    s_name = models.CharField(max_length=255, blank=True, default='',)
    f_name = models.CharField(max_length=255, blank=False)
    m_name = models.CharField(max_length=255, blank=True, null=True, default='')
    l_name = models.CharField(max_length=255, blank=False)
    prefixes = models.CharField(max_length=255, blank=True, null=True, choices=PREFIXES_LIST,  default='')
    e_add = models.CharField(max_length=255, blank=True, null=True, default='',)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    disabled = models.BooleanField(default=False)

    
    def __str__(self):
        return self.l_name + ", "+ self.f_name
    
    def get_full_name(self):
        return '{l_name}, {f_name} {m_name} {s_name} {e_name}'.format(
            l_name=self.l_name, 
            f_name=self.f_name,
            m_name=self.m_name+"." if self.m_name else '',
            s_name=self.s_name+'.' if self.s_name else '',
            e_name=self.prefixes+'.' if self.prefixes else '',
            ).strip()


    
    class Meta:
        ordering = ('date_created', )
     

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.l_name} {self.f_name} {self.m_name or ''}".strip())
        original_slug = self.slug
        count = 1
        while Author.objects.filter(slug=self.slug).exists():
            self.slug = f"{original_slug}-{count}"
            count += 1
        super(Author, self).save(*args, **kwargs)
    
    
    def get_absolute_url_edit(self):
        return reverse("ndrppcwp_admin_app:authors_edit", args=[self.id,])

    def get_absolute_url_delete(self):
        return reverse("ndrppcwp_admin_app:authors_delete", args=[self.id,])


class Research(models.Model):
    TEXT_AVAILABILITY_LIST = (
        ('Abstract','Abstract'),
        ('Full-Text','Full-Text'),
    )
    STUDY_AREA_LIST = (
        ('Source-Control Strategies', 'Source-Control Strategies'),
        ('Resource-Directed Strategies','Resource-Directed Strategies'),
        ('Revival and Rehabilitation Strategies','Revival and Rehabilitation Strategies'),
        ('Overarching Strategies','Overarching Strategies'),
    )


    SOURCE_DOCUMENT_LIST = (
        ('Sylvatrop Technical Journal of the Philippine Ecosystems','Sylvatrop Technical Journal of the Philippine Ecosystems'),
        ('Natural Resources Volume 27 Nos. 1 and 2','Natural Resources Volume 27 Nos. 1 and 2'),
        ('Herdin','Herdin'),
        ('PCIEERD','PCIEERD'), 
        ('ResearchGate','ResearchGate'),
        ('Others', 'Others'),
    )

    PUBLICATION_TYPE_LIST = (
        ('Journal','Journal'),
        ('Others', 'Others'),
    )
    CATEGORIES_LIST = (
        ('Scientific Journals','Scientific Journals'),
        ('Manuals','Manuals'),
    )

    PUBLICATION_YEAR = (
        (str(x), str(x)) for x in range(1960, 2050)
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    contrib_id = models.CharField(max_length=50, blank=True, unique=True)
    title = models.CharField(max_length=255, blank=False, unique=True)
    slug = models.SlugField(max_length=255, blank=True, unique=True, null=True)
    pdf = models.FileField(upload_to="uploaded_pdf/%Y/%m/%d", blank=False, null=True, validators=[file_validator_valid_pdf_image])
    author = models.ManyToManyField(Author, blank=False, related_name="fk_author_research")
    URL = models.URLField(blank=False, default="")
    pub_date = models.DateField(blank=False,)
    pub_year = models.CharField(blank=False, choices=PUBLICATION_YEAR, max_length=5)
    study_area = models.CharField(max_length=255, choices=STUDY_AREA_LIST, default=STUDY_AREA_LIST[0][0],)

    source_document = models.CharField(max_length=255, choices=SOURCE_DOCUMENT_LIST, default=SOURCE_DOCUMENT_LIST[0][0])
    custom_source = models.CharField(max_length=255, blank=True, null=True)  # Stores user input if "Others" is selected
    text_availability = models.CharField(max_length=255, choices=TEXT_AVAILABILITY_LIST, default=TEXT_AVAILABILITY_LIST[0][0])
    publication_type = models.CharField(max_length=255, choices=PUBLICATION_TYPE_LIST, default=PUBLICATION_TYPE_LIST[0][0])
    custom_pub_type = models.CharField(max_length=255, blank=True, null=True)  # Stores user input if "Others" is selected
    categories = models.CharField(max_length=255, choices=CATEGORIES_LIST, default='', blank=False, null=False)
    # NOTE: Is complted or not
    status = models.BooleanField(default=True)  
    remarks = models.TextField(blank=True, null=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def get_source_document(self):
        """Return the selected source document or the custom input if 'Others' is selected"""
        return self.custom_source if self.source_document == "Others" else self.source_document

    def get_publication_type(self):
        """Return the selected publication type or the custom input if 'Others' is selected"""
        return self.custom_pub_type if self.publication_type == "Others" else self.publication_type

    def __str__(self):
        return self.title

    class Meta:
        ordering = ('date_created', )

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        original_slug = self.slug
        count = 1
        while Research.objects.filter(slug=self.slug).exists():
            self.slug = f"{original_slug}-{count}"
            count += 1

        # if self.pk is not None:
        #     # Object is being updated
        #     # Do something here
        #     print("SADD")
        #     pass
        # else:
        #     print('asdasd')
        #     # Object is being created
        #     # Do something else here 
        if self._state.adding:
            # Object is being created
            # Do something here
            if not self.contrib_id:
                custom_id : str = "NRDP-PCWP"
            if self.pub_date:
                year = self.pub_date.year
            elif self.pub_year:
                year = int(self.pub_year)

            if year:
                custom_id += f"-{year}"

                # Define code needed to translate
                core_strategy_mapping = {
                    "Source-Control Strategies": "SCS",
                    "Resource-Directed Strategies": "RDS",
                    "Revival and Rehabilitation Strategies": "RRS",
                    "Overarching Strategies": "OS",
                }

                # Debugging: Print core strategy before mapping
                print(f"Study Area Before Mapping: {self.study_area}")

                # Get the correct core strategy code, fallback to "UNK" (Unknown)
                core_strategy_code = core_strategy_mapping.get(self.study_area, "UNK")

                # Debugging: Print core strategy code after mapping
                print(f"Mapped Core Strategy Code: {core_strategy_code}")

                # Get the latest series number for this strategy and year
                latest_contrib = (
                    Research.objects.filter(study_area=self.study_area, pub_date__year=year)
                        .order_by("-contrib_id")
                        .values_list("contrib_id", flat=True)
                        .first()
                )

                if latest_contrib:
                    try:
                        last_series_number = int(latest_contrib.split("-")[-1])  # Extract last number
                        new_series_number = str(last_series_number + 1).zfill(3)  # Increment and format as 3 digits
                    except ValueError:
                        new_series_number = "001"
                else:
                    new_series_number = "001"

                self.contrib_id = f"{custom_id}-{core_strategy_code}-{new_series_number}"

                print(f"Generated Contrib ID: {self.contrib_id}")

            else:
                # Fallback kung walang valid year na nilagay
                self.contrib_id = f"{custom_id}-{str(shortuuid.uuid()).upper()}"
                print(f"Fallback Contrib ID: {self.contrib_id}")

        super(Research, self).save(*args, **kwargs)
    
        
    def get_absolute_url_edit(self):
        return reverse("ndrppcwp_admin_app:researches_edit", args=[self.id,])

    def get_absolute_url_delete(self):
        return reverse("ndrppcwp_admin_app:researches_delete", args=[self.id,])
    
    def get_absolute_url_view(self):
        return reverse("ndrppcwp_app:research_detail", args=[self.slug,])

    def get_absolute_url_report_error(self):
        return reverse("ndrppcwp_app:create_report_error", args=[self.slug,])
    
class AbstractResearch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    research = models.OneToOneField(Research, related_name="fk_abstract_research", on_delete=models.CASCADE)
    text = models.TextField()
    counter = models.IntegerField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.research.title



class ReportError(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4) 
    name = models.CharField(max_length=50)
    research = models.ForeignKey(Research, on_delete=models.CASCADE, related_name="fk_report_error_research")
    email = models.EmailField(max_length=50)
    org = models.CharField(max_length=200)
    text = models.TextField()  
    date_created = models.DateTimeField(auto_now_add=True)

    
    def __str__(self):
        return self.research.title
    
    def get_absolute_url_view(self):
        return reverse("ndrppcwp_admin_app:report_errors_view", args=[self.id,])
    
