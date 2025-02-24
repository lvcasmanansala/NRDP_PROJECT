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
        } 
     
        self.fields['email'].widget.attrs = {
            'class': 'form-control  ',  
        }
     
        self.fields['org'].widget.attrs = {
            'class': 'form-control  ',  
        }
     
        self.fields['text'].widget.attrs = {
            'class': 'form-control  ',  
        }
     
   