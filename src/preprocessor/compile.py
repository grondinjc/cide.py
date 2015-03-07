import os
import sass

PREPROCESSOR_STYLE_EXT = '.scss'
COMPILED_STYLE_EXT = '.css'

def compile(scss_dir_path, output_dir):
  # Detect all SASS files
  scss_files = ["{0}/{1}".format(scss_dir_path,filename) 
                for filename in os.listdir(scss_dir_path) 
                if filename.endswith(PREPROCESSOR_STYLE_EXT)]

  # Process all detected SASS files
  for scss in scss_files:
    # for more options, check help by doing 
    # python -c "import sass;help(sass.compile)
    compiled_css = sass.compile(filename=scss)
    compiled_css_path = os.path.join(output_dir, 
                                     os.path.basename(scss).replace(PREPROCESSOR_STYLE_EXT, 
                                                                    COMPILED_STYLE_EXT))
    # Open file in write mode to override any existing content
    with open(compiled_css_path, 'w') as compiled_file:
      compiled_file.write(compiled_css)

if __name__ == "__main__":
  # Calling this script will allow to change the css files
  # during execution without having to stop the instance.

  # Look for files in the same directory as this script
  current_dir_path = os.path.dirname(os.path.abspath(__file__))
  output_dir_path = os.path.normpath(os.path.join(current_dir_path, '../static/css'))
  
  # Launch compilation
  compile(current_dir_path, output_dir_path)