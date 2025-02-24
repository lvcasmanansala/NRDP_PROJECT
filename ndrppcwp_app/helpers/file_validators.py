import os  
from django.core.exceptions import ValidationError

_TO_KB = 0.001
_TO_MB = 1e-6
_MAX_FILE_SIZE_MB = 5
def __file_controller(mode): 
    _modes = ['image_only', 'pdf_only', 'pdf_image', 'files_only']

    _images = ['.jpg', '.png', '.jpeg',]
    _pdf = ['.pdf',]
    _files = ['.xls', '.xlsx', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.pdf']

    _file_options = {
        "image_only": {
            "type": _images,
            "error_message": f"Valid files: ({' '.join(_images)})"
        },
        "pdf_only": {
            "type": _pdf,
            "error_message": f"Valid files: ({' '.join(_pdf)})"
        }, 
        "pdf_image": {
            "type": _pdf + _images,
            "error_message": f"Valid files: ({' '.join(_pdf + _images)})"
        },
        "files_only": {
            "type": _files,
            "error_message": f"Valid files: ({' '.join(_files)})"
        }

    } 

    if mode in _modes:
        return _file_options[mode]

def file_validator_image(f):
    """
        NOTE:
        Validates the type of image, file and size
    """ 
    fc = __file_controller('image_only')

    file_extension = os.path.splitext(f.name)[1]  
    file_size = f.size * _TO_MB

    if not file_extension.lower() in fc['type']: 
        raise ValidationError(fc['error_message'])

    else:
        if file_size > _MAX_FILE_SIZE_MB:
            raise ValidationError(f"The maximum file size can be upload is {_MAX_FILE_SIZE_MB} MB")
        else: 
            return f

def file_validator_valid_pdf_image(f): 
    """
        NOTE:
        Validates the type of image, file and size
    """ 
    fc = __file_controller('pdf_image')
    
    file_extension = os.path.splitext(f.name)[1]  
    file_size = f.size * _TO_MB  
    
    if not file_extension.lower() in fc['type']: 
        error_message = fc['error_message']  
        raise ValidationError(error_message) 
    else:
        if file_size > _MAX_FILE_SIZE_MB:
            raise ValidationError(f"The maximum file size can be upload is {_MAX_FILE_SIZE_MB} MB")
        else: 
            return f

def file_validator_valid_standard_files(f): 
    """
        NOTE:
        Validates the type of image, file and size
    """ 
    fc = __file_controller('files_only')
    
    file_extension = os.path.splitext(f.name)[1]  
    file_size = f.size * _TO_MB  
    
    if not file_extension.lower() in fc['type']: 
        error_message = fc['error_message']  
        raise ValidationError(error_message) 
    else:
        if file_size > _MAX_FILE_SIZE_MB:
            raise ValidationError(f"The maximum file size can be upload is {_MAX_FILE_SIZE_MB} MB")
        else: 
            return f

 