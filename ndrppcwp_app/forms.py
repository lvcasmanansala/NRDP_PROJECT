from django import forms
from ndrppcwp_app import models

class ReportErrorForm(forms.ModelForm):  

    class Meta:
        model = models.ReportError
        exclude = ( 'id', 'date_created', 'research')
        
  
    def __init__(self, *args, **kwargs):
        super(ReportErrorForm, self).__init__(*args, **kwargs)

        """
            Apply predefined attributes of html element
        """  
        self.fields['name'].widget.attrs = {
            'class': 'form-control  ',
            'placeholder': 'Your Name'
        } 
     
        self.fields['email'].widget.attrs = {
            'class': 'form-control  ',
            'placeholder': 'Your Email'
        }
     
        self.fields['org'].widget.attrs = {
            'class': 'form-control  ',
            'placeholder': 'Organization/Agency/Institution'
        }
     
        self.fields['text'].widget.attrs = {
            'class': 'form-control  ',
            'placeholder': 'Describe what went wrong...',
            'rows': 4
        }
     
   