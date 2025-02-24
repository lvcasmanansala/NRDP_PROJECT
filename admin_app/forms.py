from django import forms
from ndrppcwp_app import models
from django.forms.widgets import RadioSelect

class AuthorForm(forms.ModelForm): 
     
    class Meta:
        model = models.Author
        exclude = ( 'id', 'slug', 'date_updated', 'date_created', )
        
  
    def __init__(self, *args, **kwargs):
        super(AuthorForm, self).__init__(*args, **kwargs)
        """
            Apply predefined attributes of html element
        """ 
      
        self.fields['s_name'].widget.attrs = {
            'class': 'form-control  ', 
            'placeholder': 'Suffix Name',  
        }
        self.fields['f_name'].widget.attrs = {
            'class': 'form-control  ', 
            'placeholder': 'First Name', 
            'required': 'required'
        }
        self.fields['m_name'].widget.attrs = {
            'class': 'form-control  ', 
            'placeholder': 'Middle Name',  
        }
        self.fields['l_name'].widget.attrs = {
            'class': 'form-control  ', 
            'placeholder': 'Last Name', 
            'required': 'required'
        }
         
        self.fields['prefixes'].widget.attrs = {
            'class': 'form-control  select2', 
            'placeholder': 'Prefix',  
        }

         
class ResearchForm(forms.ModelForm):  

    abstract_text = forms.CharField(widget=forms.Textarea(
        attrs={
            'rows':3,
            'class': 'form-control'
        })
        ) 
    status = forms.ChoiceField(widget=forms.RadioSelect, choices=[(True, 'Yes'), (False, 'No')])

    pub_date = forms.DateField(
        widget=forms.DateInput(
            format='%m/%d/%Y',
            attrs={
                'id': 'pub_date',
                'type': 'text',
                'class': 'form-control drp',
                # 'data-inputmask-alias': 'datetime',
                # 'data-inputmask-inputformat': 'mm/dd/yyyy',
                # 'data-target': '#date',
                # 'data-mask': '',
                'placeholder': 'Date',
            }
        ),
        input_formats=('%m/%d/%Y', )
    ) 
    class Meta:
        model = models.Research
        exclude = ( 'id', 'slug', 'date_updated', 'date_created', 'contrib_id')
        
  
    def __init__(self, *args, **kwargs):
        super(ResearchForm, self).__init__(*args, **kwargs)
        """
            Apply predefined attributes of html element
        """ 
      
        
        self.fields['title'].widget.attrs = {
            'class': 'form-control  ', 
            'placeholder': 'Title', 
            'required': 'required'
        }
        self.fields['author'].label_from_instance = lambda obj : f"{obj.l_name}, {obj.f_name} {obj.m_name}" 
        self.fields['author'].widget.attrs = {
            'class': 'form-control  select2',    
        }
        self.fields['URL'].widget.attrs = {
            'class': 'form-control  ', 
            'placeholder': 'URL',  
        }
     
        # self.fields['pub_date'].widget.attrs = { 
        #     'class': 'form-control datemask', 
        #     'data-inputmask-alias': 'datetime', 
        #     'data-inputmask-inputformat': 'mm/dd/yyyy', 
        #     'data-mask': '', 
        #     'inputmode': 'numeric', 
        # }
        self.fields['pdf'].widget.attrs = {
            'class': 'd-block',    
            'accept': 'application/pdf'
        }
        self.fields['pub_year'].widget.attrs = {
            'class': 'form-control  select2',    
        }
        self.fields['study_area'].widget.attrs = {
            'class': 'form-control  select2',    
        }
        self.fields['source_document'].widget.attrs = {
            'class': 'form-control  select2',    
        }
        self.fields['text_availability'].widget.attrs = {
            'class': 'form-control  select2',    
        }
        self.fields['publication_type'].widget.attrs = {
            'class': 'form-control  select2',    
        }
        self.fields['publication_type'].widget.attrs = {
            'class': 'form-control  select2',    
        }
        self.fields['categories'].widget.attrs = {
            'class': 'form-control select2',    
        }
        self.fields['remarks'].widget.attrs = {
            'class': 'form-control',    
        }